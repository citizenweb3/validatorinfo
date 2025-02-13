import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import TotalsListProposals from '@/app/networks/[id]/governance/totals-list-proposals';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import LiveProposals from '@/app/networks/[id]/governance/live-proposals';
import { SortDirection } from '@/server/types';
import NetworkProposals from '@/app/networks/[id]/governance/network-proposals-list/network-proposals';

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

const NetworkPassportPage: NextPageWithLocale<PageProps> = async ({
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
    <div className="mb-20">
      <PageTitle prefix={`${chain?.prettyName}:` ?? 'Network:'} text={t('title')} />
      <Suspense fallback={<div />}>
        <TotalsListProposals />
      </Suspense>
      <LiveProposals />
      <NetworkProposals page={'VotingSummaryPage'}
                        perPage={perPage}
                        currentPage={currentPage}
                        sort={{ sortBy, order }} />
    </div>
  );
};

export default NetworkPassportPage;
