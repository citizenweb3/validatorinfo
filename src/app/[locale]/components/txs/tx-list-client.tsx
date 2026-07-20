'use client';

import { useTranslations } from 'next-intl';
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getTxsBatch } from '@/actions/get-txs-batch';
import TxCursorPagination from '@/components/txs/tx-cursor-pagination';
import TxRow from '@/components/txs/tx-row';
import TxRowsSkeleton from '@/components/txs/tx-rows-skeleton';
import type { Cursor, TxByAddressBatch, TxByAddressItem } from '@/services/tx-service';
import { type TxFilters, txFiltersToInput } from '@/utils/tx-filters';

const PER_PAGE = 20;
const PREFETCH_RUNWAY = PER_PAGE * 2; // start the next-batch fetch when fewer than 2 windows remain ahead

interface LoadedBatch {
  cursor: Cursor | null; // the cursor that produced this batch (null = head)
  rows: TxByAddressItem[];
  nextCursor: Cursor | null;
  hasMore: boolean;
}

interface OwnProps {
  addresses: string[];
  chainName: string;
  initialCursor: Cursor | null; // cursor that produced `initial` (from the URL `c`)
  initialWindow: number; // window within `initial` (from the URL `w`, clamped server-side)
  initial: TxByAddressBatch;
  filters: TxFilters;
}

const cursorKey = (cursor: Cursor | null): string =>
  cursor ? `${cursor.before_height}-${cursor.before_index}` : 'head';

const MessageRow: FC<{ message: string; columns: number; hint?: string; action?: ReactNode }> = ({
  message,
  columns,
  hint,
  action,
}) => (
  <tbody>
    <tr>
      <td colSpan={columns} className="py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="font-sfpro text-lg text-white/60">{message}</div>
          {hint && <div className="font-sfpro text-sm text-white/40">{hint}</div>}
          {action}
        </div>
      </td>
    </tr>
  </tbody>
);

const TxListClient: FC<OwnProps> = ({
  addresses,
  chainName,
  initialCursor,
  initialWindow,
  initial,
  filters,
}) => {
  const t = useTranslations('TotalTxsPage');
  const columns = 4;

  const [loaded, setLoaded] = useState<LoadedBatch[]>([
    { cursor: initialCursor, rows: initial.rows, nextCursor: initial.nextCursor, hasMore: initial.hasMore },
  ]);
  const [windowIdx, setWindowIdx] = useState<number>(initialWindow);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState<boolean>(Boolean(initial.error));
  const inFlight = useRef<Set<string>>(new Set());
  const didMount = useRef(false);

  const loadedRows = useMemo(() => loaded.flatMap((batch) => batch.rows), [loaded]);
  const tail = loaded[loaded.length - 1];
  const totalLoadedWindows = Math.max(1, Math.ceil(loadedRows.length / PER_PAGE));
  const windowRows = loadedRows.slice(windowIdx * PER_PAGE, windowIdx * PER_PAGE + PER_PAGE);
  const isLastWindow = (windowIdx + 1) * PER_PAGE >= loadedRows.length;
  const hasNext = !isLastWindow || tail.hasMore;

  // Append the next batch (forward). Deduped by cursor via the inFlight ref so a fast clicker / the
  // prefetch effect can't double-fetch or append out of order.
  const fetchNext = useCallback(async () => {
    const last = loaded[loaded.length - 1];
    if (!last.hasMore || !last.nextCursor) return;
    const key = cursorKey(last.nextCursor);
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setLoading(true);
    const res = await getTxsBatch(addresses, chainName, txFiltersToInput(filters), last.nextCursor);
    inFlight.current.delete(key);
    setLoading(false);
    if (!res.ok) {
      setErrored(true);
      return;
    }
    setErrored(false);
    setLoaded((prev) => {
      if (prev.some((batch) => cursorKey(batch.cursor) === key)) return prev; // race guard
      return [...prev, { cursor: last.nextCursor, rows: res.rows, nextCursor: res.nextCursor, hasMore: res.hasMore }];
    });
  }, [addresses, chainName, filters, loaded]);

  // Re-fetch the head batch by its own cursor and replace it (recovers a failed cold-load).
  const reloadHead = useCallback(async () => {
    const head = loaded[0];
    const key = `reload:${cursorKey(head.cursor)}`;
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    setLoading(true);
    const res = await getTxsBatch(addresses, chainName, txFiltersToInput(filters), head.cursor ?? undefined);
    inFlight.current.delete(key);
    setLoading(false);
    if (!res.ok) {
      setErrored(true);
      return;
    }
    setErrored(false);
    setLoaded([{ cursor: head.cursor, rows: res.rows, nextCursor: res.nextCursor, hasMore: res.hasMore }]);
    setWindowIdx((i) => Math.min(i, Math.max(0, Math.ceil(res.rows.length / PER_PAGE) - 1)));
  }, [addresses, chainName, filters, loaded]);

  // Load-ahead: prefetch the next batch when ≤2 windows remain ahead of the current one. On a
  // 5-window batch this fires at window 3 (`batchStart+2`, e.g. pages 3/8/13), leaving pages 4–5 as
  // runway before the batch boundary at page 6. `<=` so the trigger lands exactly on that boundary
  // (with `<` it slipped a window late → fired at page 4 → page 6 wasn't ready in time).
  useEffect(() => {
    const rowsAhead = loadedRows.length - (windowIdx + 1) * PER_PAGE;
    if (rowsAhead <= PREFETCH_RUNWAY && tail.hasMore && !loading && !errored) {
      fetchNext();
    }
  }, [windowIdx, loadedRows.length, tail.hasMore, loading, errored, fetchNext]);

  // URL sync (client-only via history; no server round-trip). Reflects the current window as ?c=&w=
  // so copy-link / F5 / Back land exactly. We read c/w client-side, never the server header.
  useEffect(() => {
    const locate = (idx: number): { cursor: Cursor | null; w: number } => {
      let acc = 0;
      for (const batch of loaded) {
        const wins = Math.max(1, Math.ceil(batch.rows.length / PER_PAGE));
        if (idx < acc + wins) return { cursor: batch.cursor, w: idx - acc };
        acc += wins;
      }
      return { cursor: tail.cursor, w: 0 };
    };
    const { cursor, w } = locate(windowIdx);
    const sp = new URLSearchParams(window.location.search);
    if (cursor) sp.set('c', `${cursor.before_height}-${cursor.before_index}`);
    else sp.delete('c');
    if (w > 0) sp.set('w', String(w));
    else sp.delete('w');
    const qs = sp.toString();
    const url = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
    const state = { txWindow: windowIdx };
    if (!didMount.current) {
      didMount.current = true;
      window.history.replaceState(state, '', url);
    } else {
      window.history.pushState(state, '', url);
    }
  }, [windowIdx, loaded, tail.cursor]);

  // Browser Back/Forward restores the window from history state (batches stay in memory).
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const idx = (event.state as { txWindow?: number } | null)?.txWindow;
      setWindowIdx(typeof idx === 'number' && idx >= 0 ? idx : 0);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handlePrev = useCallback(() => setWindowIdx((i) => Math.max(0, i - 1)), []);
  const handleNext = useCallback(() => {
    if (hasNext) setWindowIdx((i) => i + 1);
  }, [hasNext]);
  const handleSelect = useCallback((page: number) => setWindowIdx(Math.max(0, page - 1)), []);
  const handleRetry = useCallback(() => {
    setErrored(false);
    if (loadedRows.length === 0) {
      reloadHead();
    } else {
      fetchNext();
    }
  }, [loadedRows.length, reloadHead, fetchNext]);

  const retryAction = (
    <button type="button" onClick={handleRetry} className="font-handjet text-base text-highlight underline">
      {t('retry')}
    </button>
  );

  let body: ReactNode;
  if (loadedRows.length === 0) {
    if (errored) {
      body = <MessageRow message={t('txListLoadError')} columns={columns} action={retryAction} />;
    } else if (loading) {
      body = <TxRowsSkeleton rows={PER_PAGE} columns={columns} />;
    } else {
      body = <MessageRow message={t('noTransactionsYet')} columns={columns} hint={t('transactionsWillAppear')} />;
    }
  } else if (windowRows.length === 0) {
    // advanced into a window that is still loading (or whose fetch failed)
    body = errored ? (
      <MessageRow message={t('txListLoadError')} columns={columns} action={retryAction} />
    ) : (
      <TxRowsSkeleton rows={PER_PAGE} columns={columns} />
    );
  } else {
    body = (
      <tbody>
        {windowRows.map((item) => (
          <TxRow key={item.hash} item={item} chainName={chainName} />
        ))}
      </tbody>
    );
  }

  return (
    <>
      {body}
      <tbody>
        <tr>
          <td colSpan={columns} className="pt-4">
            <TxCursorPagination
              current={windowIdx + 1}
              loadedWindows={totalLoadedWindows}
              hasMore={tail.hasMore}
              onSelect={handleSelect}
              onPrev={handlePrev}
              onNext={handleNext}
              prevLabel={t('prevPage')}
              nextLabel={t('nextPage')}
            />
          </td>
        </tr>
      </tbody>
    </>
  );
};

export default TxListClient;
