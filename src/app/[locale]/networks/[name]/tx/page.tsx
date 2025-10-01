import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import TotalTxsMetrics from '@/app/networks/[name]/tx/total-txs-metrics';
import { SortDirection } from '@/server/types';
import NetworkTxs from '@/app/networks/[name]/tx/txs-table/network-txs';
import Link from 'next/link';
import SubDescription from '@/components/sub-description';

interface PageProps {
  params: NextPageWithLocale & { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'TotalTxsPage' });

  return {
    title: t('title'),
  };
}

const TotalTxsPage: NextPageWithLocale<PageProps> = async ({
    params: { name, locale }, searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'TotalTxsPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';
  const chain = await chainService.getByName(name);

  return (
    <div className="mb-24">
      <PageTitle
        text={t('title')}
        prefix={
          <Link href={`/networks/${chain?.name}/overview`} className="group">
            <div className="flex flex-row">
              <span className="group-hover:text-oldPalette-white group-active:text-3xl">
                {chain?.prettyName}
              </span>
              <div className="h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a" />
            </div>
          </Link>
        }
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <TotalTxsMetrics />
      <NetworkTxs name={name} page={'TotalTxsPage'} perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} />
    </div>
  );
};

export default TotalTxsPage;
