import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { Chain, Proposal } from '@prisma/client';
import SubTitle from '@/components/common/sub-title';
import {
  ecosystemsProposalsResults,
} from '@/app/networks/[id]/(network-profile)/governance/network-proposals-list/network-proposals-item';

type VoteType = 'yes' | 'no' | 'veto' | 'abstain';
type Ecosystem = keyof typeof ecosystemsProposalsResults;

interface OwnProps {
  proposal: Proposal | null;
  chain: Chain | null;
}

const ProposalMetrics: FC<OwnProps> = async ({ proposal, chain }) => {
  const t = await getTranslations('ProposalPage');

  const getTallyResults = <T extends Ecosystem>(
    tallyResult: any,
    decimals: number,
    voteType: VoteType,
    ecosystem: T,
  ) => {
    try {
      const fields = ecosystemsProposalsResults[ecosystem];
      const tally = JSON.parse(tallyResult);

      const votes: Record<VoteType, number> = {
        yes: Number(tally[fields.yes]),
        no: Number(tally[fields.no]),
        abstain: Number(tally[fields.abstain]),
        veto: Number(tally[fields.veto]),
      };

      const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
      const divisor = totalVotes === 0 ? 1 : totalVotes;

      return {
        title: voteType,
        percents: (votes[voteType] / divisor) * 100,
        amount: votes[voteType] / 10 ** decimals,
      };
    } catch {
      return {
        title: 'unknown',
        percents: 0,
        amount: 0,
      };
    }
  };

  const rawTally =
    chain?.ecosystem === 'namada'
      ? proposal?.tallyResult
      : proposal?.finalTallyResult;

  const yesResults = getTallyResults(
    rawTally,
    chain?.coinDecimals ?? 6,
    'yes',
    chain?.ecosystem as 'cosmos',
  );
  const noResults = getTallyResults(
    rawTally,
    chain?.coinDecimals ?? 6,
    'no',
    chain?.ecosystem as 'cosmos',
  );
  const abstainResults = getTallyResults(
    rawTally,
    chain?.coinDecimals ?? 6,
    'abstain',
    chain?.ecosystem as 'cosmos',
  );
  const vetoResults = getTallyResults(
    rawTally,
    chain?.coinDecimals ?? 6,
    'veto',
    chain?.ecosystem as 'cosmos',
  );

  const totalList = [yesResults, noResults, abstainResults, vetoResults];

  return (
    <div className="mt-4 mb-6">
      <SubTitle text={t('votes')} />
      <div className="mt-8 flex w-full flex-row justify-center gap-7">
        {totalList.map((item) => (
          <MetricsCardItem
            key={item.title}
            title={t(item.title as VoteType)}
            data={item.percents.toFixed(2)}
            isPercents
            addLineData={`${item.amount.toFixed(2).toLocaleString()} ${chain?.denom}`}
            className="pb-4 pt-2.5"
            dataClassName="mt-2"
            addLineClassName="font-handjet font-thin text-lg -mt-1"
          />
        ))}
      </div>
    </div>
  );
};

export default ProposalMetrics;
