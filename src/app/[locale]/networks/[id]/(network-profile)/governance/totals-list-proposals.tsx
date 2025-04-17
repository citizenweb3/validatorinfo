import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { Proposal } from '@prisma/client';

interface OwnProps {
  proposals: Proposal[];
}

const TotalsListProposals: FC<OwnProps> = async ({ proposals }) => {
  const t = await getTranslations('NetworkGovernance');
  const proposalsPassed = proposals?.filter(proposal => proposal.status === 'PROPOSAL_STATUS_PASSED');
  const proposalsRejected = proposals?.filter(proposal => proposal.status === 'PROPOSAL_STATUS_REJECTED');

  return (
    <div className="mt-8 flex w-full flex-row justify-center gap-6">
      <MetricsCardItem title={t('total')}
                       data={(proposals.length)}
                       className={'pb-6 pt-2.5'}
                       dataClassName={'mt-5'} />
      <MetricsCardItem title={t('passed')}
                       data={proposalsPassed.length}
                       className={'pb-6 pt-2.5'}
                       dataClassName={'mt-5'} />
      <MetricsCardItem title={t('rejected')}
                       data={proposalsRejected.length}
                       className={'pb-6 pt-2.5'}
                       dataClassName={'mt-5'} />
    </div>
  );
};

export default TotalsListProposals;
