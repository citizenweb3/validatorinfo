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
      const tally = JSON.parse(tallyResult ?? '{}');

      if (tally[fields[voteType]] === undefined) return null;

      const votes: Record<VoteType, number> = {
        yes: Number(tally[fields.yes] ?? 0),
        no: Number(tally[fields.no] ?? 0),
        abstain: Number(tally[fields.abstain] ?? 0),
        veto: Number(tally[fields.veto] ?? 0),
      };

      const total = Object.values(votes).reduce((s, n) => s + n, 0) || 1;

      return {
        title: voteType,
        percents: (votes[voteType] / total) * 100,
        amount: votes[voteType] / 10 ** decimals,
      };
    } catch {
      return null;
    }
  };

  const rawTally =
    chain?.ecosystem === 'namada'
      ? proposal?.tallyResult
      : proposal?.finalTallyResult;

  const results = (['yes', 'no', 'abstain', 'veto'] as VoteType[])
    .map((vt) =>
      getTallyResults(rawTally, chain?.coinDecimals ?? 6, vt, chain?.ecosystem as Ecosystem),
    ).filter(Boolean) as Exclude<ReturnType<typeof getTallyResults>, null>[];


  return (
    <div className="mt-4 mb-6">
      <SubTitle text={t('votes')} />
      <div className="mt-8 flex w-full flex-row justify-center gap-7">
        {results.map((item) => (
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
