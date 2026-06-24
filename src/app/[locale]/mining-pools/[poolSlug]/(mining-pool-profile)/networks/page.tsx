import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import HashrateWindowSelector from '@/app/networks/[name]/(network-profile)/stats/hashrate-window-selector';
import PageTitle from '@/components/common/page-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import TableAvatar from '@/components/common/table/table-avatar';
import TableHeaderItem from '@/components/common/table/table-header-item';
import db from '@/db';
import { Locale, NextPageWithLocale } from '@/i18n';
import moneroService, { HashrateWindow, isValidWindow } from '@/services/monero-service';
import { formatHashrate } from '@/utils/format-hashrate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { poolSlug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale, poolSlug } }: { params: { locale: Locale; poolSlug: string } }) {
  const t = await getTranslations({ locale, namespace: 'MiningPoolDetail' });
  const pool = await db.miningPool.findFirst({ where: { slug: poolSlug }, select: { name: true } });

  return { title: pool ? `${pool.name} — ${t('metaTitle')}` : t('metaTitle') };
}

// Default (centre) tab — the pool's technical stats per NETWORK it mines, mirroring the validator-profile
// networks tab (first column = Network, then the metrics) via BaseTable + TableHeaderItem.
const MiningPoolNetworksPage: NextPageWithLocale<PageProps> = async ({ params: { locale, poolSlug }, searchParams: q }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'MiningPoolDetail' });

  const pool = await db.miningPool.findFirst({
    where: { slug: poolSlug },
    include: { chain: true, stats: true },
  });

  if (!pool) notFound();
  if (!pool.isVerified) notFound();

  const availableWindows = await moneroService.getMoneroAvailableWindows();
  const windowRaw = Array.isArray(q.window) ? q.window[0] : q.window;
  const requested: HashrateWindow = isValidWindow(windowRaw) ? windowRaw : '24h';
  const safeWindow: HashrateWindow = availableWindows.includes(requested) ? requested : '24h';

  const stat = pool.stats.find((s) => s.windowKind === safeWindow) ?? null;
  const feeText = pool.feePercent != null ? `${pool.feePercent.toFixed(2)}%` : '-';

  const windowLabels: Record<HashrateWindow, string> = {
    '24h': t('window24h'),
    '7d': t('window7d'),
    '30d': t('window30d'),
    all: t('windowAll'),
  };
  const windowOptions = availableWindows.map((value) => ({ value, label: windowLabels[value] }));

  return (
    <div className="mb-24 flex flex-col gap-8">
      <PageTitle prefix={pool.name} text={t('networksTitle')} />
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
              <TableHeaderItem page="MiningPoolProfileHeader" name="Hashrate" />
              <TableHeaderItem page="MiningPoolProfileHeader" name="Fee" />
            </tr>
          </thead>
          <tbody>
            <BaseTableRow>
              <BaseTableCell className="group/avatar flex items-center px-2 py-2 font-sfpro hover:text-highlight">
                <TableAvatar
                  icon={pool.chain.logoUrl}
                  name={pool.chain.prettyName ?? pool.chain.name}
                  href={`/networks/${pool.chain.name}/overview`}
                />
              </BaseTableCell>
              <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                <div className="text-center">{stat ? stat.blocksFound.toLocaleString() : '-'}</div>
              </BaseTableCell>
              <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                <div className="text-center">{stat ? `${(stat.sharePercent ?? 0).toFixed(2)}%` : '-'}</div>
              </BaseTableCell>
              <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                <div className="text-center">{stat ? formatHashrate(stat.hashrateEstimate) : '-'}</div>
              </BaseTableCell>
              <BaseTableCell className="px-2 py-2 font-sfpro text-base">
                <div className="text-center">{feeText}</div>
              </BaseTableCell>
            </BaseTableRow>
          </tbody>
        </BaseTable>
      </section>
    </div>
  );
};

export default MiningPoolNetworksPage;
