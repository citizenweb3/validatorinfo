import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import HashrateWindowSelector from '@/app/networks/[name]/(network-profile)/stats/hashrate-window-selector';
import PageTitle from '@/components/common/page-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import TableHeaderItem from '@/components/common/table/table-header-item';
import Tooltip from '@/components/common/tooltip';
import { Locale, NextPageWithLocale } from '@/i18n';
import miningPoolService from '@/services/mining-pool-service';
import { HashrateWindow, isValidWindow } from '@/services/monero-service';
import { formatHashrate } from '@/utils/format-hashrate';
import { getFreshMinersCount } from '@/utils/monero-pool-miners';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { poolSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const WINDOW_ORDER: HashrateWindow[] = ['24h', '7d', '30d', 'all'];

export async function generateMetadata({ params: { locale, poolSlug } }: { params: { locale: Locale; poolSlug: string } }) {
  const [t, pools] = await Promise.all([
    getTranslations({ locale, namespace: 'MiningPoolDetail' }),
    miningPoolService.getNetworksBySlug(poolSlug),
  ]);
  const pool = pools[0];

  return { title: pool ? `${pool.name} — ${t('metaTitle')}` : t('metaTitle') };
}

// Default (centre) tab — the pool's technical stats per NETWORK it mines, mirroring the validator-profile
// networks tab (first column = Network, then the metrics) via BaseTable + TableHeaderItem.
const MiningPoolNetworksPage: NextPageWithLocale<PageProps> = async ({ params: { locale, poolSlug }, searchParams: q }) => {
  unstable_setRequestLocale(locale);
  const [t, tProfile, pools] = await Promise.all([
    getTranslations({ locale, namespace: 'MiningPoolDetail' }),
    getTranslations({ locale, namespace: 'MiningPoolProfileHeader' }),
    miningPoolService.getNetworksBySlug(poolSlug),
  ]);

  if (pools.length === 0) notFound();

  const availableWindows = WINDOW_ORDER.filter((window) =>
    pools.some((pool) => pool.stats.some((stat) => stat.windowKind === window)),
  );
  const windowRaw = Array.isArray(q.window) ? q.window[0] : q.window;
  const requested: HashrateWindow = isValidWindow(windowRaw) ? windowRaw : '24h';
  const safeWindow: HashrateWindow = availableWindows.includes(requested)
    ? requested
    : (availableWindows[0] ?? '24h');
  const referenceTime = Date.now();

  const windowLabels: Record<HashrateWindow, string> = {
    '24h': t('window24h'),
    '7d': t('window7d'),
    '30d': t('window30d'),
    all: t('windowAll'),
  };
  const windowOptions = availableWindows.map((value) => ({ value, label: windowLabels[value] }));

  return (
    <div className="mb-24 flex flex-col gap-8">
      <PageTitle prefix={pools[0].name} text={t('networksTitle')} />
      <section>
        {windowOptions.length > 1 && (
          <div className="flex flex-row flex-wrap items-end justify-end gap-4">
            <HashrateWindowSelector current={safeWindow} options={windowOptions} />
          </div>
        )}
        <BaseTable className="mt-4">
          <thead>
            <tr className="bg-table_header">
              <TableHeaderItem page="MiningPoolProfileHeader" name="Network" />
              <TableHeaderItem page="MiningPoolProfileHeader" name="Blocks" />
              <TableHeaderItem page="MiningPoolProfileHeader" name="Share" />
              <TableHeaderItem page="MiningPoolProfileHeader" name="Miners" />
              <TableHeaderItem page="MiningPoolProfileHeader" name="Hashrate" />
              <TableHeaderItem page="MiningPoolProfileHeader" name="Fee" />
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => {
              const stat = pool.stats.find((item) => item.windowKind === safeWindow) ?? null;
              const minersCount = getFreshMinersCount(pool.minersCount, pool.minersUpdatedAt, referenceTime);
              const feeText = pool.feePercent != null ? `${pool.feePercent.toFixed(2)}%` : '-';

              return (
                <BaseTableRow key={pool.id}>
                  <BaseTableCell className="group/avatar flex items-center px-2 py-2 font-sfpro hover:text-highlight">
                    <TableAvatar
                      icon={pool.chain.logoUrl}
                      name={pool.chain.prettyName ?? pool.chain.name}
                      href={`/networks/${pool.chain.name}/overview`}
                    />
                  </BaseTableCell>
                  <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                    <div className="text-center">{stat ? stat.blocksFound.toLocaleString(locale) : '-'}</div>
                  </BaseTableCell>
                  <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                    <div className="text-center">{stat ? `${(stat.sharePercent ?? 0).toFixed(2)}%` : '-'}</div>
                  </BaseTableCell>
                  <BaseTableCell className="px-2 py-2">
                    <Tooltip tooltip={pool.slug === 'p2pool' ? tProfile('p2poolMiners') : ''} direction="top">
                      <div className="text-center font-handjet text-lg">
                        {minersCount === null ? '-' : minersCount.toLocaleString(locale)}
                      </div>
                    </Tooltip>
                  </BaseTableCell>
                  <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                    <div className="text-center">{stat ? formatHashrate(stat.hashrateEstimate) : '-'}</div>
                  </BaseTableCell>
                  <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                    <div className="text-center">{feeText}</div>
                  </BaseTableCell>
                </BaseTableRow>
              );
            })}
          </tbody>
        </BaseTable>
      </section>
    </div>
  );
};

export default MiningPoolNetworksPage;
