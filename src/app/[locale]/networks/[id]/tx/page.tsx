import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import TotalTxsMetrics from '@/app/networks/[id]/tx/total-txs-metrics';
import { SortDirection } from '@/server/types';
import NetworkTxs from '@/app/networks/[id]/tx/txs-table/network-txs';

interface PageProps {
  params: NextPageWithLocale & { id: string };
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
                                                             params: { id, locale }, searchParams: q,
                                                           }) => {
  const t = await getTranslations({ locale, namespace: 'TotalTxsPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  return (
    <div className="mb-24">
      <PageTitle text={t('title')} prefix={chain?.prettyName ?? 'Network'} />
      <TotalTxsMetrics />
      <NetworkTxs id={id} page={'TotalTxsPage'} perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} />
    </div>
  );
};

export default TotalTxsPage;
