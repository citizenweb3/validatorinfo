import { Chain } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TablePagination from '@/components/common/table/table-pagination';
import { listMoneroTransactions, MoneroTransaction } from '@/server/tools/chains/monero/indexer-client';
import { bigIntSafeCache } from '@/utils/bigint-safe-cache';
import cutHash from '@/utils/cut-hash';
import { formatBytes, formatXmrReward } from '@/utils/monero';

interface OwnProps {
  chain: Chain;
  locale: string;
  currentPage?: number;
  limit?: number;
}

const COLS = 4;

// Shield the Monero indexer: cache the tx-list payload ~10s across requests (SWR).
const getCachedTxs = bigIntSafeCache(
  (opts: Parameters<typeof listMoneroTransactions>[0]) => listMoneroTransactions(opts),
  ['monero-tx-list'],
  { revalidate: 10 },
);

// Header cell matching the site's TableSortItems look (no sort — the indexer serves desc only).
const HeaderCell: FC<{ label: string }> = ({ label }) => (
  <TableHeaderItem page={'TotalTxsPage'}>
    <div className="group flex flex-row items-center justify-center py-3">
      <div className="w-fit text-wrap text-6xl sm:text-4xl md:text-sm">
        <div className="text-nowrap font-normal">&nbsp;{label}</div>
      </div>
    </div>
  </TableHeaderItem>
);

const MoneroTxs: FC<OwnProps> = async ({ chain, locale, currentPage = 1, limit = 20 }) => {
  const t = await getTranslations({ locale, namespace: 'PowTxs' });

  if (!process.env.MONERO_INDEXER_BASE_URL) {
    return (
      <div className="mt-12 bg-table_row p-6">
        <div className="font-handjet text-2xl text-highlight">{t('indexerDisabled')}</div>
        <p className="mt-3 font-sfpro text-base">{t('indexerDisabledBody')}</p>
      </div>
    );
  }

  const offset = (currentPage - 1) * limit;
  let txs: MoneroTransaction[] = [];
  let hasMore = false;
  let fetchError: string | null = null;
  try {
    const res = await getCachedTxs({ limit, offset, order: 'desc' });
    txs = res.items;
    hasMore = res.hasMore;
  } catch (error) {
    // Log the raw cause server-side; surface only a generic message (the raw fetch error
    // leaks the internal indexer host).
    console.error('[MoneroTxs] Failed to fetch transactions:', error);
    fetchError = t('fetchError');
  }

  if (fetchError) {
    return (
      <div className="mt-12 bg-table_row p-6">
        <div className="font-handjet text-2xl text-highlight">{t('indexerDisabled')}</div>
        <p className="mt-3 font-sfpro text-base opacity-80">{fetchError}</p>
      </div>
    );
  }

  if (txs.length === 0) {
    return <div className="mt-12 bg-table_row p-6 font-sfpro text-base opacity-70">{t('noTxs')}</div>;
  }

  // Indexer exposes has_more, not a total — pad the page count so the standard paginator shows
  // "1 2 … ▷" (and stops cleanly on the last page when has_more is false).
  const pageLength = hasMore ? currentPage + 3 : currentPage;

  return (
    <div className="mt-10">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <HeaderCell label={t('txHash')} />
            <HeaderCell label={t('block')} />
            <HeaderCell label={t('fee')} />
            <HeaderCell label={t('size')} />
          </tr>
        </thead>
        <tbody>
          {txs.map((tx) => (
            <BaseTableRow key={tx.hash}>
              <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                <Link href={`/networks/${chain.name}/tx/${tx.hash}`} className="flex justify-center">
                  <span className="text-center font-handjet text-lg underline underline-offset-3">
                    {cutHash({ value: tx.hash, cutLength: 12 })}
                  </span>
                </Link>
              </BaseTableCell>
              <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                <Link href={`/networks/${chain.name}/blocks/${tx.blockHash}`} className="flex justify-center">
                  <span className="text-center font-handjet text-lg underline underline-offset-3">
                    {tx.blockHeight.toLocaleString()}
                  </span>
                </Link>
              </BaseTableCell>
              <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                <div className="text-center font-handjet text-lg">{formatXmrReward(tx.fee)}</div>
              </BaseTableCell>
              <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                <div className="text-center font-handjet text-lg">{formatBytes(tx.size)}</div>
              </BaseTableCell>
            </BaseTableRow>
          ))}
          <tr>
            <td colSpan={COLS} className="pt-4">
              <TablePagination pageLength={pageLength} hideLastPage />
            </td>
          </tr>
        </tbody>
      </BaseTable>
    </div>
  );
};

export default MoneroTxs;
