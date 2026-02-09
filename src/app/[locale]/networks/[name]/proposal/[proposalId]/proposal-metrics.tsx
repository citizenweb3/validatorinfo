import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { Proposal, ProposalStatus } from '@prisma/client';
import SubTitle from '@/components/common/sub-title';
import {
  ecosystemsProposalsResults,
} from '@/app/networks/[name]/(network-profile)/governance/network-proposals-list/network-proposals-item';
import { ChainWithParams } from '@/services/chain-service';
import { isAztecNetwork } from '@/utils/chain-utils';

type VoteType = 'yes' | 'no' | 'veto' | 'abstain';
type Ecosystem = keyof typeof ecosystemsProposalsResults;

interface OwnProps {
  proposal: Proposal | null;
  chain: ChainWithParams | null;
}

const ProposalMetrics: FC<OwnProps> = async ({ proposal, chain }) => {
  const t = await getTranslations('ProposalPage');

  const getEcosystemForChain = (chainName: string | undefined, ecosystem: string | undefined): Ecosystem => {
    if (chainName && isAztecNetwork(chainName)) {
      return 'ethereum';
    }
    return (ecosystem as Ecosystem) ?? 'cosmos';
  };

  const getTallyResults = <T extends Ecosystem>(
    tallyResult: any,
    decimals: number,
    voteType: VoteType,
    ecosystem: T,
  ) => {
    try {
      const fields = ecosystemsProposalsResults[ecosystem];
      const fieldKey = fields[voteType];

      if (fieldKey === null) return null;

      const tally = typeof tallyResult === 'string' ? JSON.parse(tallyResult) : (tallyResult ?? {});

      if (tally[fieldKey] === undefined) return null;

      const votes: Record<VoteType, number> = {
        yes: fields.yes ? Number(tally[fields.yes] ?? 0) : 0,
        no: fields.no ? Number(tally[fields.no] ?? 0) : 0,
        abstain: fields.abstain ? Number(tally[fields.abstain] ?? 0) : 0,
        veto: fields.veto ? Number(tally[fields.veto] ?? 0) : 0,
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

  const ecosystem = getEcosystemForChain(chain?.name, chain?.ecosystem);

  const rawTally =
    ecosystem === 'ethereum' || chain?.ecosystem === 'namada'
      ? proposal?.tallyResult
      : proposal?.finalTallyResult;

  const voteTypes: VoteType[] = ecosystem === 'ethereum'
    ? ['yes', 'no']
    : ['yes', 'no', 'abstain', 'veto'];

  const results = voteTypes
    .map((vt) =>
      getTallyResults(rawTally, chain?.params?.coinDecimals ?? 18, vt, ecosystem),
    ).filter(Boolean) as Exclude<ReturnType<typeof getTallyResults>, null>[];

  if (results.length === 0) {
    return null;
  }

  const isAztecSignalingPhase = chain?.name && isAztecNetwork(chain.name) &&
    proposal?.status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;

  if (isAztecSignalingPhase) {
    try {
      const tallyString = typeof rawTally === 'string' ? rawTally : JSON.stringify(rawTally ?? {});
      const tally = JSON.parse(tallyString);
      const yeaAmount = Number(tally.yea ?? 0);
      const nayAmount = Number(tally.nay ?? 0);
      const totalDeposit = (yeaAmount + nayAmount) / 10 ** (chain?.params?.coinDecimals ?? 18);

      if (totalDeposit > 0) {
        return (
          <div className="mt-4 mb-6">
            <SubTitle text={t('gse deposit')} />
            <div className="mt-8 flex w-full flex-row justify-center gap-7">
              <MetricsCardItem
                title={t('deposited gse tokens')}
                data={`${totalDeposit.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${chain?.params?.denom}`}
                className={'py-6'}
                dataClassName={'mt-5'} />
            </div>
          </div>
        );
      }
    } catch {}
  }

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
            addLineData={`${item.amount.toFixed(2).toLocaleString()} ${chain?.params?.denom ?? ''}`}
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
