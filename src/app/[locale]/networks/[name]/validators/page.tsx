import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import { SortDirection } from '@/server/types';
import NetworkValidators from '@/app/networks/[name]/validators/network-validators-table/network-validators';
import Link from 'next/link';
import SubDescription from '@/components/sub-description';

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
    params: { name, locale },
    searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkValidatorsPage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'moniker') ?? 'moniker';
  const order = (q.order as SortDirection) ?? 'asc';
  const nodeStatus: string[] = !q.node_status ? [] : typeof q.node_status === 'string' ? [q.node_status] : q.node_status;

  const chain = await chainService.getByName(name);

  return (
    <div className="mb-12">
      <PageTitle
        text={t('title')}
        prefix={
          <Link href={`/networks/${name}/overview`} className="group">
            <div className="flex flex-row">
              <span className="group-hover:text-oldPalette-white group-active:text-3xl">
                {chain?.prettyName}
              </span>
              <div className="h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a" />
            </div>
          </Link>
        }
      />
      <SubDescription text={t('description', { networkName: chain?.prettyName })} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NetworkValidators
        chainId={chain?.id ?? null}
        page={'NetworkValidatorsPage'}
        nodeStatus={nodeStatus}
        perPage={perPage}
        sort={{ sortBy, order }}
        currentPage={currentPage} />
    </div>
  );
};

export default NetworkValidatorsPage;
