import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import moneroService, { HashrateWindow, isValidWindow } from '@/services/monero-service';

import HashrateWindowSelector from './hashrate-window-selector';
import MoneroEmission from './monero-emission';
import NetworkHealth from './network-health';

interface OwnProps {
  window: HashrateWindow;
}

// Share-based bar colour (centralisation signal), mirrors the app's PowerBarChart palette.
const barColor = (pct: number): string => {
  if (pct > 33) return '#EB1616B2';
  if (pct >= 10) return '#E5C46BB2';
  return '#4FB848B2';
};

// PoW network stats — the centralisation "Pool Distribution" bars. The per-pool technical table lives on
// /networks/[name]/mining-pools (reachable from the network header), so it is not duplicated here.
const PowNetworkStats: FC<OwnProps> = async ({ window }) => {
  const t = await getTranslations('PowNetworkStats');

  const availableWindows = await moneroService.getMoneroAvailableWindows();
  const requested: HashrateWindow = isValidWindow(window) ? window : '24h';
  const safeWindow: HashrateWindow = availableWindows.includes(requested) ? requested : '24h';

  const rawStats = await moneroService.getMoneroPoolStats(safeWindow);
  // Pin the unknown/solo bucket last; keep the rest share-desc (design §7).
  const poolStats = [...rawStats].sort(
    (a, b) => (a.pool.slug === 'unknown' ? 1 : 0) - (b.pool.slug === 'unknown' ? 1 : 0),
  );

  const windowLabels: Record<HashrateWindow, string> = {
    '24h': t('window24h'),
    '7d': t('window7d'),
    '30d': t('window30d'),
    all: t('windowAll'),
  };
  const windowOptions = availableWindows.map((value) => ({ value, label: windowLabels[value] }));

  return (
    <div className="mt-5 flex flex-col gap-8">
      <section>
        <div className="flex flex-row items-end justify-between">
          <SubTitle text={t('poolDistribution')} />
          {windowOptions.length > 1 && <HashrateWindowSelector current={safeWindow} options={windowOptions} />}
        </div>
        {poolStats.length > 0 ? (
          <div className="mt-4 flex flex-col gap-2">
            {poolStats.map((stat) => {
              const pct = stat.sharePercent ?? 0;
              // Unknown/solo is a mix of many miners, not one pool — neutral grey, not a centralisation colour.
              const fillColor = stat.pool.slug === 'unknown' ? '#6B7280B2' : barColor(pct);
              return (
                <div key={stat.id} className="flex items-center gap-4 bg-table_row px-4 py-3">
                  {stat.pool.isVerified && stat.pool.slug !== 'unknown' ? (
                    <Link
                      href={`/mining-pools/${stat.pool.slug}/networks`}
                      className="w-56 shrink-0 truncate font-sfpro text-base underline underline-offset-3 hover:text-highlight"
                    >
                      {stat.pool.name}
                    </Link>
                  ) : (
                    <span className="w-56 shrink-0 truncate font-sfpro text-base">{stat.pool.name}</span>
                  )}
                  <div className="relative h-4 flex-1 overflow-hidden rounded-sm bg-bgSt">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: fillColor }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-handjet text-base text-highlight">
                    {pct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 bg-table_row p-6 font-sfpro text-base opacity-70">{t('noPoolData')}</div>
        )}
      </section>
      <NetworkHealth poolStats={poolStats} window={safeWindow} />
      <MoneroEmission />
    </div>
  );
};

export default PowNetworkStats;
