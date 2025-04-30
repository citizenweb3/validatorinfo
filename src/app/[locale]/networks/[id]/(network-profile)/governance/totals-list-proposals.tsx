import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { Proposal } from '@prisma/client';
import ToolTip from '@/components/common/tooltip';

interface OwnProps {
  proposals: Proposal[];
}

const TotalsListProposals: FC<OwnProps> = async ({ proposals }) => {
  const t = await getTranslations('NetworkGovernance');
  const proposalsPassed = proposals?.filter(proposal => proposal.status === 'PROPOSAL_STATUS_PASSED');
  const proposalsRejected = proposals?.filter(proposal => proposal.status === 'PROPOSAL_STATUS_REJECTED');

  return (
    <div>
      <div className="mt-8 flex w-full flex-row justify-center gap-6">
        <ToolTip tooltip={t('total tooltip')} direction={'top'}>
          <MetricsCardItem title={t('total')}
                           data={proposals.length}
                           className={'pb-6 pt-2.5'}
                           dataClassName={'mt-5'} />
        </ToolTip>
        <MetricsCardItem title={t('passed')}
                         data={proposalsPassed.length}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
        <MetricsCardItem title={t('rejected')}
                         data={proposalsRejected.length}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
      </div>
      <div className="mt-8 flex w-full flex-row justify-center gap-6">
        <MetricsCardItem title={t('voting participation rate')}
                         data="80"
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'}
                         isPercents
        />
        <MetricsCardItem title={t('quorum threshold')}
                         data="40"
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'}
                         isPercents />
      </div>
      <div className="mt-20 flex items-center justify-between px-4 py-1 shadow-button mx-auto w-fit">
        <div className="font-sfpro text-lg">{t('governance token distribution')}:</div>
        <div className="ml-24 px-24 font-handjet text-xl text-highlight">$124.43K</div>
      </div>
    </div>
  );
};

export default TotalsListProposals;
