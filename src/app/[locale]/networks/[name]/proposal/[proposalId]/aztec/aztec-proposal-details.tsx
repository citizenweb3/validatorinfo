import { Proposal } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';

import {
  formatSecondsToDuration,
  formatWeiAsPercentage,
  formatWeiAsTokenAmount,
  getEtherscanUrl,
  parseAztecProposalContent,
} from './aztec-proposal-utils';
import DetailRow from '@/app/networks/[name]/proposal/[proposalId]/aztec/detail-row';

interface OwnProps {
  proposal: Proposal;
  chainName: string;
}

const AztecProposalDetails: FC<OwnProps> = async ({ proposal, chainName }) => {
  const t = await getTranslations('ProposalPage');

  const parsedContent = parseAztecProposalContent(proposal.content);

  if (!parsedContent) {
    return null;
  }

  const { payload, proposer, config } = parsedContent;

  return (
    <div className="mt-6 mb-4">
      <SubTitle text={t('proposal details')} />

      <DetailRow
        label={t('proposer')}
        value={proposer}
        href={getEtherscanUrl(proposer, chainName)}
        isExternal
      />
      <DetailRow
        label={t('payload contract')}
        value={payload}
        href={getEtherscanUrl(payload, chainName)}
        isExternal
      />
      <DetailRow
        label={t('quorum')}
        value={formatWeiAsPercentage(config.quorum)}
      />
      <DetailRow
        label={t('minimum votes')}
        value={formatWeiAsTokenAmount(config.minimumVotes)}
      />
      <DetailRow
        label={t('required margin')}
        value={formatWeiAsPercentage(config.requiredYeaMargin)}
      />
      <DetailRow
        label={t('voting delay')}
        value={formatSecondsToDuration(config.votingDelay)}
      />
      <DetailRow
        label={t('voting duration')}
        value={formatSecondsToDuration(config.votingDuration)}
      />
      <DetailRow
        label={t('execution delay')}
        value={formatSecondsToDuration(config.executionDelay)}
      />
      <DetailRow
        label={t('grace period')}
        value={formatSecondsToDuration(config.gracePeriod)}
      />
    </div>
  );
};

export default AztecProposalDetails;
