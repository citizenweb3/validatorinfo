import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import MiningPoolMetrics from '@/app/mining-pools/[poolSlug]/(mining-pool-profile)/metrics/mining-pool-metrics';
import PoolConfigurationSection from '@/app/mining-pools/[poolSlug]/(mining-pool-profile)/metrics/pool-configuration';
import MiningPoolPageTitle from '@/app/mining-pools/[poolSlug]/(mining-pool-profile)/mining-pool-page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import miningPoolConfigurationService from '@/services/mining-pool-configuration-service';
import moneroService, { HashrateWindow, isValidWindow } from '@/services/monero-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { poolSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({
  params: { locale, poolSlug },
}: {
  params: { locale: Locale; poolSlug: string };
}) {
  const [t, pool] = await Promise.all([
    getTranslations({ locale, namespace: 'MiningPoolDetail' }),
    moneroService.getMoneroPoolBySlug(poolSlug),
  ]);

  return { title: pool ? `${pool.name} — ${t('metaTitle')}` : t('metaTitle') };
}

const DEFAULT_WINDOW: HashrateWindow = '24h';

const MiningPoolMetricsPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, poolSlug },
  searchParams: q,
}) => {
  unstable_setRequestLocale(locale);

  const [t, pool, availableWindows] = await Promise.all([
    getTranslations({ locale, namespace: 'MiningPoolDetail' }),
    moneroService.getMoneroPoolBySlug(poolSlug),
    moneroService.getMoneroAvailableWindows(),
  ]);

  if (!pool) notFound();
  if (!pool.isVerified) notFound();
  if (pool.chain.name !== 'monero') notFound();

  const windowRaw = Array.isArray(q.window) ? q.window[0] : q.window;
  const requested: HashrateWindow = isValidWindow(windowRaw) ? windowRaw : DEFAULT_WINDOW;
  const safeWindow: HashrateWindow = availableWindows.includes(requested) ? requested : DEFAULT_WINDOW;

  const windowLabels: Record<HashrateWindow, string> = {
    '24h': t('window24h'),
    '7d': t('window7d'),
    '30d': t('window30d'),
    all: t('windowAll'),
  };
  const windowOptions = availableWindows.map((value) => ({ value, label: windowLabels[value] }));
  const stat = pool.stats.find((item) => item.windowKind === safeWindow) ?? null;

  const [allTimeBlocks, recentBlocks, configuration] = await Promise.all([
    moneroService.getMoneroPoolBlocksCount(pool.chainId, pool.id),
    moneroService.getMoneroPoolRecentBlocks(pool.chainId, pool.id, 1, 0, 'timestamp', 'desc'),
    miningPoolConfigurationService.getBySlug(pool.slug),
  ]);

  return (
    <div className="mb-24 flex flex-col gap-8">
      <MiningPoolPageTitle
        chainName={pool.chain.name}
        chainPrettyName={pool.chain.prettyName ?? pool.chain.name}
        poolName={pool.name}
        poolSlug={pool.slug}
        preposition={t('pretextInPrefix')}
        text={t('metricsProfileTitle')}
      />
      <MiningPoolMetrics
        allTimeBlocks={allTimeBlocks}
        chainName={pool.chain.name}
        currentWindow={safeWindow}
        currentWindowLabel={windowLabels[safeWindow]}
        feePercent={pool.feePercent}
        labels={{
          metricsTitle: t('metricsTitle'),
          hashrate: t('hashrateMetric'),
          poolFee: t('poolFeeMetric'),
          blocksFound: t('blocksFoundMetric'),
          marketShare: t('marketShareMetric'),
          lastBlockFound: t('lastBlockFoundMetric'),
          allTime: t('allTimeLabel'),
          noData: t('notEnoughData'),
        }}
        lastBlock={recentBlocks[0] ?? null}
        locale={locale}
        stat={stat}
        windowOptions={windowOptions}
      />
      {configuration && <PoolConfigurationSection configuration={configuration} locale={locale} />}
    </div>
  );
};

export default MiningPoolMetricsPage;
