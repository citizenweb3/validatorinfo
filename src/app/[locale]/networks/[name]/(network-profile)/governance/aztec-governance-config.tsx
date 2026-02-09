import { FC } from 'react';
import { getTranslations } from 'next-intl/server';

import SubTitle from '@/components/common/sub-title';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import aztecGovernanceService from '@/services/aztec-governance-service';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics;
}

const AztecGovernanceConfig: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkGovernance');

  let config = null;
  let power = null;

  try {
    [config, power] = await Promise.all([
      aztecGovernanceService.getGovernanceConfigDisplay(chain.name),
      aztecGovernanceService.getVotingPowerDisplay(chain.name),
    ]);
  } catch (error) {
    console.error('Failed to fetch governance config:', error);
  }

  if (!config || !power) return null;

  return (
    <div className="mt-6 mb-4">
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <MetricsCardItem title={t('quorum')}
                         data={config.quorum}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
        <MetricsCardItem title={t('min-votes')}
                         data={config.minimumVotes}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
        <MetricsCardItem title={t('yea-margin')}
                         data={config.requiredYeaMargin}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <MetricsCardItem title={t('voting-delay')}
                         data={config.votingDelay}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
        <MetricsCardItem title={t('voting-duration')}
                         data={config.votingDuration}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
        <MetricsCardItem title={t('execution-delay')}
                         data={config.executionDelay}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        <MetricsCardItem title={t('grace-period')}
                         data={config.gracePeriod}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
        <MetricsCardItem title={t('lock-amount')}
                         data={`${config.lockAmount} ${chain?.params?.denom}`}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
        <MetricsCardItem title={t('voting-power-title')}
                         data={`${power.totalPower} ${chain?.params?.denom}`}
                         className={'pb-6 pt-2.5'}
                         dataClassName={'mt-5'} />
      </div>
    </div>
  );
};

export default AztecGovernanceConfig;
