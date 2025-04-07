import { getTranslations } from 'next-intl/server';

import TotalsListProposals from '@/app/networks/[id]/(network-profile)/governance/totals-list-proposals';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import LiveProposals from '@/app/networks/[id]/(network-profile)/governance/live-proposals';
import { SortDirection } from '@/server/types';
import NetworkProposals
  from '@/app/networks/[id]/(network-profile)/governance/network-proposals-list/network-proposals';
import SubDescription from '@/components/sub-description';

interface PageProps {
  params: NextPageWithLocale & { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkGovernance' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const NetworkGovernancePage: NextPageWithLocale<PageProps> = async ({
    params: { locale, id }, searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkGovernance' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div className="mb-6">
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <TotalsListProposals />
      <LiveProposals chainId={id} />
      <NetworkProposals page={'VotingSummaryPage'}
                        perPage={perPage}
                        currentPage={currentPage}
                        sort={{ sortBy, order }}
                        chainId={id} />
    </div>
  );
};

export default NetworkGovernancePage;
