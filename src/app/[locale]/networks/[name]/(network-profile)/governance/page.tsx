import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import AztecGovernanceConfig from '@/app/networks/[name]/(network-profile)/governance/aztec-governance-config';
import CommitteeTable from '@/app/networks/[name]/(network-profile)/governance/aztec-committee/committee-table';
import LiveProposals from '@/app/networks/[name]/(network-profile)/governance/live-proposals';
import NetworkProposals
  from '@/app/networks/[name]/(network-profile)/governance/network-proposals-list/network-proposals';
import TotalsListProposals from '@/app/networks/[name]/(network-profile)/governance/totals-list-proposals';
import {
  AztecSlashingEventDisplay,
  convertToDisplayFormat,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/aztec-slashing-types';
import GovernanceSlashingEventsTable
  from '@/app/networks/[name]/(network-profile)/governance/slashing-events/governance-slashing-events-table';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import TableDropdown from '@/components/common/table-dropdown';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import chainService from '@/services/chain-service';
import ProposalService from '@/services/proposal-service';
import SlashingEventService from '@/services/slashing-event-service';
import { isAztecNetwork } from '@/utils/chain-utils';
import GovernanceTokenDistribution
  from '@/app/networks/[name]/(network-profile)/governance/governance-token-distribution';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkGovernance' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 5;

const NetworkGovernancePage: NextPageWithLocale<PageProps> = async ({ params: { locale, name }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkGovernance' });
  const chain = await chainService.getByName(name);

  const proposalsList = await ProposalService.getListByChainName(name);

  const isAztec = isAztecNetwork(name);

  if (isAztec && chain) {
    // Handle separate pagination for committee table
    const committeeCurrentPage = parseInt((q.committee_p as string) || '1');
    const committeePerPage = 5; // Default for committee table
    const committeeSortBy = (q.sortBy as string) ?? 'validator';
    const committeeOrder = (q.order as SortDirection) ?? 'asc';

    // Handle separate pagination for proposals table
    const proposalsCurrentPage = parseInt((q.p as string) || '1');
    const proposalsPerPage = 5; // Default for proposals table
    const proposalsSortBy = 'votingEndTime';
    const proposalsOrder = 'desc';

    let slashingEventsDisplay: AztecSlashingEventDisplay[] = [];

    try {
      const slashingEvents = await SlashingEventService.getRecentSlashingEvents(chain.id, 10);
      slashingEventsDisplay = slashingEvents.map((event) => convertToDisplayFormat(event));
    } catch (error) {
      console.error('Failed to load slashing events:', error);
    }

    return (
      <div className="mb-6">
        <PageTitle prefix={chain.prettyName ?? 'Network'} text={t('title')} />
        <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />

        <CommitteeTable
          chain={chain}
          sort={{ sortBy: committeeSortBy, order: committeeOrder }}
          perPage={committeePerPage}
          currentPage={committeeCurrentPage}
        />

        <div className="mt-14">
          {slashingEventsDisplay.length > 0 ? (
            <TableDropdown<AztecSlashingEventDisplay[]>
              page="NetworkGovernance"
              Table={GovernanceSlashingEventsTable as FC<{ items: AztecSlashingEventDisplay[] }>}
              items={slashingEventsDisplay}
            />
          ) : (
            <div className="mt-8 text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="mt-4 text-gray-500">{t('no-slashing-events')}</p>
            </div>
          )}
        </div>

        <AztecGovernanceConfig chain={chain} />

        <div className="mt-8">
          <SubTitle text={t('proposals-title')} />
          <TotalsListProposals proposals={proposalsList} chain={chain} />
          <LiveProposals proposals={proposalsList} chainName={name} />
          <NetworkProposals
            page={'VotingSummaryPage'}
            perPage={proposalsPerPage}
            currentPage={proposalsCurrentPage}
            sort={{ sortBy: proposalsSortBy, order: proposalsOrder }}
            chain={chain}
          />
        </div>
      </div>
    );
  }

  // For non-AZTEC networks, use the existing pagination approach
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'votingEndTime') ?? 'votingEndTime';
  const order = (q.order as SortDirection) ?? 'desc';

  return (
    <div className="mb-6">
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <TotalsListProposals proposals={proposalsList} chain={chain} />
      <GovernanceTokenDistribution />
      <LiveProposals proposals={proposalsList} chainName={name} />
      <NetworkProposals
        page={'VotingSummaryPage'}
        perPage={perPage}
        currentPage={currentPage}
        sort={{ sortBy, order }}
        chain={chain}
      />
    </div>
  );
};

export default NetworkGovernancePage;
