import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import NetworkMiningPools from '@/app/networks/[name]/mining-pools/network-mining-pools-table/network-mining-pools';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import { HashrateWindow } from '@/services/monero-service';
import { SortDirection } from '@/server/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkMiningPoolsPage' });

  return {
    title: t('title'),
  };
}

const NetworkMiningPoolsPage: NextPageWithLocale<PageProps> = async ({ params: { name, locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkMiningPoolsPage' });

  const rawWindow = Array.isArray(q.window) ? q.window[0] : q.window;
  const window = (rawWindow ?? '24h') as HashrateWindow;
  const sortBy = (Array.isArray(q.sortBy) ? q.sortBy[0] : q.sortBy) ?? 'sharePercent';
  const order = ((Array.isArray(q.order) ? q.order[0] : q.order) as SortDirection) ?? 'desc';

  const chain = await chainService.getByName(name);

  return (
    <div className="mb-12">
      <PageTitle
        text={t('title')}
        prefix={
          <Link href={`/networks/${name}/overview`} className="group">
            <div className="flex flex-row">
              <span className="group-hover:text-oldPalette-white group-active:text-3xl">{chain?.prettyName}</span>
              <div className="h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a" />
            </div>
          </Link>
        }
      />
      <SubDescription
        text={t('description', { networkName: chain?.prettyName ?? name })}
        contentClassName={'m-4'}
        plusClassName={'mt-2'}
      />
      <NetworkMiningPools chainName={name} window={window} sort={{ sortBy, order }} />
    </div>
  );
};

export default NetworkMiningPoolsPage;
