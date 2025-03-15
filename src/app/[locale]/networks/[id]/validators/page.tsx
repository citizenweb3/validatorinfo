import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import { SortDirection } from '@/server/types';
import NetworkValidators from '@/app/networks/[id]/validators/network-validator-table/network-validators';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkValidatorsPage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 25;

const NetworkValidatorsPage: NextPageWithLocale<PageProps> = async (
  {
    params: { id, locale },
    searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkValidatorsPage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'moniker') ?? 'moniker';
  const order = (q.order as SortDirection) ?? 'asc';
  const nodeStatus: string[] = !q.node_status ? [] : typeof q.node_status === 'string' ? [q.node_status] : q.node_status;

  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  return (
    <div className="mb-12">
      <PageTitle text={t('title')} prefix={chain?.prettyName ?? 'Network'} />
      <NetworkValidators
        chainId={chainId}
        page={'NetworkValidatorsPage'}
        nodeStatus={nodeStatus}
        perPage={perPage}
        sort={{ sortBy, order }}
        currentPage={currentPage} />
    </div>
  );
};

export default NetworkValidatorsPage;
