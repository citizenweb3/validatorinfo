'use client';

import { useTranslations } from 'next-intl';
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getDelegateEventsBatch } from '@/actions/get-delegate-events-batch';
import DelegateRow from '@/components/delegations/delegate-row';
import DelegateRowsSkeleton from '@/components/delegations/delegate-rows-skeleton';
import {
  encodeDelegationCursorToken,
} from '@/components/delegations/delegation-cursor-token';
import TxCursorPagination from '@/components/txs/tx-cursor-pagination';
import type { DelegationBatch, DelegationCursor, DelegationItem } from '@/services/delegation-service';

const PER_PAGE = 20;
const PREFETCH_RUNWAY = PER_PAGE * 2;

interface LoadedBatch {
  cursor: DelegationCursor | null;
  rows: DelegationItem[];
  nextCursor: DelegationCursor | null;
  hasMore: boolean;
}

interface OwnProps {
  validator: string;
  chainName: string;
  initialCursor: DelegationCursor | null;
  initialWindow: number;
  initial: DelegationBatch;
  unit: 'token' | 'usd';
  price: number;
}

const cursorKey = (cursor: DelegationCursor | null): string =>
  cursor ? encodeDelegationCursorToken(cursor) : 'head';

const MessageRow: FC<{ message: string; action?: ReactNode }> = ({ message, action }) => (
  <tbody>
    <tr>
      <td colSpan={5} className="py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="font-sfpro text-lg text-white/60">{message}</div>
          {action}
        </div>
      </td>
    </tr>
  </tbody>
);

const DelegateListClient: FC<OwnProps> = ({
  validator,
  chainName,
  initialCursor,
  initialWindow,
  initial,
  unit,
  price,
}) => {
  const t = useTranslations('RichListPage');

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

  const fetchNext = useCallback(async () => {
    const last = loaded[loaded.length - 1];
    if (!last.hasMore || !last.nextCursor) return;

    const key = cursorKey(last.nextCursor);
    if (inFlight.current.has(key)) return;

    inFlight.current.add(key);
    setLoading(true);
    const result = await getDelegateEventsBatch(chainName, validator, last.nextCursor);
    inFlight.current.delete(key);
    setLoading(false);

    if (!result.ok) {
      setErrored(true);
      return;
    }

    setErrored(false);
    setLoaded((prev) => {
      if (prev.some((batch) => cursorKey(batch.cursor) === key)) return prev;
      return [
        ...prev,
        {
          cursor: last.nextCursor,
          rows: result.rows,
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
        },
      ];
    });
  }, [chainName, loaded, validator]);

  const reloadHead = useCallback(async () => {
    const head = loaded[0];
    const key = `reload:${cursorKey(head.cursor)}`;
    if (inFlight.current.has(key)) return;

    inFlight.current.add(key);
    setLoading(true);
    const result = await getDelegateEventsBatch(chainName, validator, head.cursor ?? undefined);
    inFlight.current.delete(key);
    setLoading(false);

    if (!result.ok) {
      setErrored(true);
      return;
    }

    setErrored(false);
    setLoaded([{ cursor: head.cursor, rows: result.rows, nextCursor: result.nextCursor, hasMore: result.hasMore }]);
    setWindowIdx((index) => Math.min(index, Math.max(0, Math.ceil(result.rows.length / PER_PAGE) - 1)));
  }, [chainName, loaded, validator]);

  useEffect(() => {
    const rowsAhead = loadedRows.length - (windowIdx + 1) * PER_PAGE;
    if (rowsAhead <= PREFETCH_RUNWAY && tail.hasMore && !loading && !errored) {
      fetchNext();
    }
  }, [windowIdx, loadedRows.length, tail.hasMore, loading, errored, fetchNext]);

  useEffect(() => {
    const locate = (index: number): { cursor: DelegationCursor | null; pageWindow: number } => {
      let windowsBeforeBatch = 0;

      for (const batch of loaded) {
        const windowsInBatch = Math.max(1, Math.ceil(batch.rows.length / PER_PAGE));
        if (index < windowsBeforeBatch + windowsInBatch) {
          return { cursor: batch.cursor, pageWindow: index - windowsBeforeBatch };
        }
        windowsBeforeBatch += windowsInBatch;
      }

      return { cursor: tail.cursor, pageWindow: 0 };
    };

    const { cursor, pageWindow } = locate(windowIdx);
    const searchParams = new URLSearchParams(window.location.search);
    if (cursor) searchParams.set('c', encodeDelegationCursorToken(cursor));
    else searchParams.delete('c');
    if (pageWindow > 0) searchParams.set('w', String(pageWindow));
    else searchParams.delete('w');

    const queryString = searchParams.toString();
    const url = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;
    const state = { delegateWindow: windowIdx };

    if (!didMount.current) {
      didMount.current = true;
      window.history.replaceState(state, '', url);
    } else {
      window.history.pushState(state, '', url);
    }
  }, [windowIdx, loaded, tail.cursor]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const index = (event.state as { delegateWindow?: number } | null)?.delegateWindow;
      setWindowIdx(typeof index === 'number' && index >= 0 ? index : 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePrev = useCallback(() => setWindowIdx((index) => Math.max(0, index - 1)), []);
  const handleNext = useCallback(() => {
    if (hasNext) setWindowIdx((index) => index + 1);
  }, [hasNext]);
  const handleSelect = useCallback((page: number) => setWindowIdx(Math.max(0, page - 1)), []);
  const handleRetry = useCallback(() => {
    setErrored(false);
    if (loadedRows.length === 0) {
      reloadHead();
      return;
    }
    fetchNext();
  }, [fetchNext, loadedRows.length, reloadHead]);

  const retryAction = (
    <button type="button" onClick={handleRetry} className="font-handjet text-base text-highlight underline">
      {t('retry')}
    </button>
  );

  let body: ReactNode;
  if (loadedRows.length === 0) {
    if (errored) {
      body = <MessageRow message={t('delegationsLoadError')} action={retryAction} />;
    } else if (loading) {
      body = <DelegateRowsSkeleton rows={PER_PAGE} />;
    } else {
      body = <MessageRow message={t('noDelegations')} />;
    }
  } else if (windowRows.length === 0) {
    body = errored
      ? <MessageRow message={t('delegationsLoadError')} action={retryAction} />
      : <DelegateRowsSkeleton rows={PER_PAGE} />;
  } else {
    body = (
      <tbody>
        {windowRows.map((item, index) => (
          <DelegateRow
            key={`${item.txHash}-${item.blockHeight}-${item.address}-${index}`}
            item={item}
            chainName={chainName}
            unit={unit}
            price={price}
          />
        ))}
      </tbody>
    );
  }

  return (
    <>
      {body}
      <tbody>
        <tr>
          <td colSpan={5} className="pt-4">
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

export default DelegateListClient;
