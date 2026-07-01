import { Chain } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TablePagination from '@/components/common/table/table-pagination';
import { listMoneroBlocks, MoneroBlock } from '@/server/tools/chains/monero/indexer-client';
import { getPoolByBlockHashes } from '@/services/monero-service';
import { bigIntSafeCache } from '@/utils/bigint-safe-cache';
import cutHash from '@/utils/cut-hash';
import { formatTimestamp } from '@/utils/format-timestamp';

interface OwnProps {
  chain: Chain;
  locale: string;
  currentPage?: number;
  limit?: number;
}

const COLS = 4;

// Shield the Monero indexer: cache the block-list payload ~10s across requests (SWR). Pool
// attribution (getPoolByBlockHashes) below stays uncached, so "Mined By" is always fresh.
const getCachedBlocks = bigIntSafeCache(
  (opts: Parameters<typeof listMoneroBlocks>[0]) => listMoneroBlocks(opts),
  ['monero-block-list'],
  { revalidate: 10 },
);

// Header cell matching the site's TableSortItems look (no sort — the indexer serves desc only).
const HeaderCell: FC<{ label: string }> = ({ label }) => (
  <TableHeaderItem page={'TotalBlocksPage'}>
    <div className="group flex flex-row items-center justify-center py-3">
      <div className="w-fit text-wrap text-6xl sm:text-4xl md:text-sm">
        <div className="text-nowrap font-normal">&nbsp;{label}</div>
      </div>
    </div>
  </TableHeaderItem>
);

const PowBlocks: FC<OwnProps> = async ({ chain, locale, currentPage = 1, limit = 20 }) => {
  const t = await getTranslations({ locale, namespace: 'PowBlocks' });

  if (!process.env.MONERO_INDEXER_BASE_URL) {
    return (
      <div className="mt-12 bg-table_row p-6">
        <div className="font-handjet text-2xl text-highlight">{t('indexerDisabled')}</div>
        <p className="mt-3 font-sfpro text-base">{t('indexerDisabledBody')}</p>
      </div>
    );
  }

  const offset = (currentPage - 1) * limit;
  let blocks: MoneroBlock[] = [];
  let hasMore = false;
  let fetchError: string | null = null;
  try {
    const res = await getCachedBlocks({ limit, offset, order: 'desc' });
    blocks = res.items;
    hasMore = res.hasMore;
  } catch (error) {
    // Log the raw cause server-side; surface only a generic message (the raw fetch error
    // leaks the internal indexer host).
    console.error('[PowBlocks] Failed to fetch blocks:', error);
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

  if (blocks.length === 0) {
    return <div className="mt-12 bg-table_row p-6 font-sfpro text-base opacity-70">{t('noBlocks')}</div>;
  }

  // "Mined By" comes from on-chain attribution (MoneroBlockAttribution). Reward, size, difficulty,
  // tx count etc. live on the block detail page, not the list.
  const poolMap = await getPoolByBlockHashes(blocks.map((b) => b.hash));
  // Indexer exposes has_more, not a total — pad the page count so the standard paginator shows
  // "1 2 … ▷" (and stops cleanly on the last page when has_more is false).
  const pageLength = hasMore ? currentPage + 3 : currentPage;

  return (
    <div className="mt-12">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <HeaderCell label={t('hash')} />
            <HeaderCell label={t('height')} />
            <HeaderCell label={t('time')} />
            <HeaderCell label={t('minedBy')} />
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => {
            const pool = poolMap.get(block.hash);
            const link = `/networks/${chain.name}/blocks/${block.hash}`;
            return (
              <BaseTableRow key={block.hash}>
                <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                  <Link href={link} className="flex justify-center">
                    <span className="text-center font-handjet text-lg underline underline-offset-3">
                      {cutHash({ value: block.hash, cutLength: 12 })}
                    </span>
                  </Link>
                </BaseTableCell>
                <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                  <Link href={link} className="flex justify-center">
                    <span className="text-center font-handjet text-lg">{block.height.toLocaleString()}</span>
                  </Link>
                </BaseTableCell>
                <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                  <Link href={link} className="flex justify-center">
                    <span className="text-center font-sfpro text-base">
                      {formatTimestamp(new Date(block.timestamp * 1000))}
                    </span>
                  </Link>
                </BaseTableCell>
                <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
                  {pool && pool.isVerified ? (
                    <Link href={`/mining-pools/${pool.slug}/networks`} className="flex justify-center">
                      <span className="text-center font-handjet text-lg underline underline-offset-3">
                        {pool.name}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex justify-center">
                      <span className="text-center font-handjet text-lg">{pool?.name ?? t('unknownPool')}</span>
                    </div>
                  )}
                </BaseTableCell>
              </BaseTableRow>
            );
          })}
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

export default PowBlocks;
