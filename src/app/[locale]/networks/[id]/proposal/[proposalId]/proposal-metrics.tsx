import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { Chain, Proposal } from '@prisma/client';
import SubTitle from '@/components/common/sub-title';

type VoteType = 'yes' | 'no' | 'veto' | 'abstain';

interface OwnProps {
  proposal: Proposal | null;
  chain: Chain | null;
}

const ProposalMetrics: FC<OwnProps> = async ({ proposal, chain }) => {
  const t = await getTranslations('ProposalPage');

  const getTallyResults = (finalTallyResult: any, decimals: number, voteType: VoteType) => {
    try {
      const tally = JSON.parse(finalTallyResult);

      const votes: Record<VoteType, number> = {
        yes: Number(tally.yes_count),
        no: Number(tally.no_count),
        abstain: Number(tally.abstain_count),
        veto: Number(tally.no_with_veto_count),
      };

      const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
      const divisor = totalVotes === 0 ? 1 : totalVotes;

      return {
        title: voteType,
        percents: (votes[voteType] / divisor) * 100,
        amount: votes[voteType] / 10 ** decimals,
      };
    } catch (error) {
      return {
        title: 'unknown',
        percents: 0,
        amount: 0,
      };
    }
  };

  const yesResults = getTallyResults(proposal?.finalTallyResult, chain?.coinDecimals ?? 6, 'yes');
  const noResults = getTallyResults(proposal?.finalTallyResult, chain?.coinDecimals ?? 6, 'no');
  const abstainResults = getTallyResults(proposal?.finalTallyResult, chain?.coinDecimals ?? 6, 'abstain');
  const vetoResults = getTallyResults(proposal?.finalTallyResult, chain?.coinDecimals ?? 6, 'veto');

  const totalList = [yesResults, noResults, abstainResults, vetoResults];

  return (
    <div className="mt-4 mb-6">
      <SubTitle text={t('votes')} />
      <div className="mt-8 flex w-full flex-row justify-center gap-7">
        {totalList.map((item) => (
          <MetricsCardItem key={item.title}
                           title={t(item.title as VoteType)}
                           data={item.percents.toFixed(2)}
                           isPercents
                           addLineData={`${item.amount.toFixed(2).toLocaleString()} ${chain?.denom}`}
                           className={'pb-4 pt-2.5'}
                           dataClassName={'mt-2'}
                           addLineClassName={'font-handjet font-thin text-lg -mt-1'}
          />
        ))}
      </div>
    </div>

  );
};

export default ProposalMetrics;
