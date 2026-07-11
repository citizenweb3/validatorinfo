import { getLocale, getTranslations } from 'next-intl/server';
import { FC } from 'react';

import HashrateWindowSelector from '@/app/networks/[name]/(network-profile)/stats/hashrate-window-selector';
import NetworkMiningPoolsItem from '@/app/networks/[name]/mining-pools/network-mining-pools-table/network-mining-pools-item';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import moneroService, { HashrateWindow, MoneroPoolStatsRow, isValidWindow } from '@/services/monero-service';
import { SortDirection } from '@/server/types';
import { getFreshMinersCount } from '@/utils/monero-pool-miners';

interface OwnProps {
  chainName: string;
  window: HashrateWindow;
  sort: { sortBy: string; order: SortDirection };
}

// Sort key extraction for the numeric columns ("name" is compared lexically in the comparator).
const sortValue = (row: MoneroPoolStatsRow, sortBy: string, referenceTime: number): number => {
  if (sortBy === 'blocksFound') return row.blocksFound;
  if (sortBy === 'feePercent') return row.pool.feePercent ?? -1;
  if (sortBy === 'miners') return getFreshMinersCount(row.pool.minersCount, row.pool.minersUpdatedAt, referenceTime) ?? -1;
  return row.sharePercent ?? 0;
};

const NetworkMiningPools: FC<OwnProps> = async ({ chainName, window, sort }) => {
  const [t, locale] = await Promise.all([
    getTranslations('NetworkMiningPoolsPage'),
    getLocale(),
  ]);

  // Pool attribution is a Monero-only capability today; other networks have no pools to list.
  if (chainName !== 'monero') {
    return <div className="mt-6 bg-table_row p-6 font-sfpro text-base opacity-70">{t('empty')}</div>;
  }

  const availableWindows = await moneroService.getMoneroAvailableWindows();
  const requested: HashrateWindow = isValidWindow(window) ? window : '24h';
  const safeWindow: HashrateWindow = availableWindows.includes(requested) ? requested : '24h';

  const rawStats = await moneroService.getMoneroPoolStats(safeWindow);
  const referenceTime = Date.now();

  // Single comparator: the synthetic "unknown/solo" bucket is always pinned last (design §7),
  // and within the rest we sort by the requested field/direction (name lexically, rest numerically).
  const poolStats = [...rawStats].sort((a, b) => {
    const aUnknown = a.pool.slug === 'unknown' ? 1 : 0;
    const bUnknown = b.pool.slug === 'unknown' ? 1 : 0;
    if (aUnknown !== bUnknown) return aUnknown - bUnknown;

    if (sort.sortBy === 'name') {
      const cmp = a.pool.name.toLowerCase().localeCompare(b.pool.name.toLowerCase());
      return sort.order === 'asc' ? cmp : -cmp;
    }
    const diff = sortValue(a, sort.sortBy, referenceTime) - sortValue(b, sort.sortBy, referenceTime);
    return sort.order === 'asc' ? diff : -diff;
  });

  const trackedMiners = rawStats.reduce((total, stat) => {
    if (stat.pool.slug === 'unknown' || stat.pool.slug === 'p2pool') return total;
    return total + (getFreshMinersCount(stat.pool.minersCount, stat.pool.minersUpdatedAt, referenceTime) ?? 0);
  }, 0);

  const windowLabels: Record<HashrateWindow, string> = {
    '24h': t('window24h'),
    '7d': t('window7d'),
    '30d': t('window30d'),
    all: t('windowAll'),
  };
  const windowOptions = availableWindows.map((value) => ({ value, label: windowLabels[value] }));

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {trackedMiners > 0 && (
          <div>
            <div className="font-handjet text-lg text-highlight">
              {t('minersCaption', { total: trackedMiners.toLocaleString(locale) })}
            </div>
            <div className="font-sfpro text-sm text-white/60">{t('minersCaptionNote')}</div>
          </div>
        )}
        {windowOptions.length > 1 && (
          <div className="sm:ml-auto">
            <HashrateWindowSelector current={safeWindow} options={windowOptions} />
          </div>
        )}
      </div>
      <BaseTable className="my-4">
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page="NetworkMiningPoolsPage" name="Pool" sortField="name" />
            <TableHeaderItem page="NetworkMiningPoolsPage" name="Blocks" sortField="blocksFound" />
            <TableHeaderItem page="NetworkMiningPoolsPage" name="Share" sortField="sharePercent" defaultSelected />
            <TableHeaderItem page="NetworkMiningPoolsPage" name="Miners" sortField="miners" />
            <TableHeaderItem page="NetworkMiningPoolsPage" name="Hashrate" />
            <TableHeaderItem page="NetworkMiningPoolsPage" name="Fee" sortField="feePercent" />
          </tr>
        </thead>
        <tbody>
          {poolStats.length > 0 ? (
            poolStats.map((stat) => {
              const minersCount = getFreshMinersCount(
                stat.pool.minersCount,
                stat.pool.minersUpdatedAt,
                referenceTime,
              );

              return (
                <NetworkMiningPoolsItem
                  key={stat.id}
                  stat={stat}
                  minersLabel={minersCount !== null ? minersCount.toLocaleString(locale) : t('notEnoughData')}
                  minersTooltip={stat.pool.slug === 'p2pool' ? t('p2poolMiners') : ''}
                />
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="bg-table_row p-6 text-center font-sfpro text-base opacity-70">
                {t('empty')}
              </td>
            </tr>
          )}
        </tbody>
      </BaseTable>
    </div>
  );
};

export default NetworkMiningPools;
