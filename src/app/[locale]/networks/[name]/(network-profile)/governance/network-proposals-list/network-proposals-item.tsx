import { Chain, Proposal, ProposalStatus } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import Tooltip from '@/components/common/tooltip';
import { parseMessage } from '@/utils/parse-proposal-message';

interface OwnProps {
  proposal: Proposal;
  chain: Chain | null;
}

export const ecosystemsProposalsResults = {
  cosmos: {
    yes: 'yes_count',
    no: 'no_count',
    abstain: 'abstain_count',
    veto: 'no_with_veto_count',
  },
  namada: {
    yes: 'yes',
    no: 'no',
    abstain: 'abstain',
    veto: 'no_with_veto',
  },
  ethereum: {
    yes: 'yea',
    no: 'nay',
    abstain: null,
    veto: null,
  },
} as const;

type Ecosystem = keyof typeof ecosystemsProposalsResults;

const NetworkProposalItem: FC<OwnProps> = ({ proposal, chain }) => {
  const getFinalResult = <T extends Ecosystem>(tallyResult: any, ecosystem: T): string => {
    try {
      const fields = ecosystemsProposalsResults[ecosystem];

      const tally = JSON.parse(tallyResult);
      const yesCount = fields.yes ? Number(tally[fields.yes] ?? 0) : 0;
      const noCount = fields.no ? Number(tally[fields.no] ?? 0) : 0;
      const abstainCount = fields.abstain ? Number(tally[fields.abstain] ?? 0) : 0;
      const noWithVetoCount = fields.veto ? Number(tally[fields.veto] ?? 0) : 0;

      const maxValue = Math.max(yesCount, noCount, abstainCount, noWithVetoCount);

      if (maxValue === yesCount) {
        return 'Yes';
      } else if (maxValue === noCount) {
        return 'No';
      } else if (maxValue === noWithVetoCount) {
        return 'No With Veto';
      } else if (maxValue === abstainCount) {
        return 'Abstain';
      } else {
        return 'unknown';
      }
    } catch (error) {
      return 'unknown';
    }
  };

  const getDisplayResult = (): string => {
    // For rejected/failed proposals, show status instead of vote result
    if (proposal.status === ProposalStatus.PROPOSAL_STATUS_REJECTED) {
      return 'Rejected';
    }
    if (proposal.status === ProposalStatus.PROPOSAL_STATUS_FAILED) {
      return 'Failed';
    }
    if (proposal.status === ProposalStatus.PROPOSAL_STATUS_PASSED) {
      return 'Passed';
    }

    // For other statuses, show vote result
    return chain?.ecosystem === 'namada'
      ? getFinalResult(proposal.tallyResult, chain.ecosystem)
      : getFinalResult(proposal.finalTallyResult, chain?.ecosystem as 'cosmos');
  };

  const results = getDisplayResult();

  const proposalLink = `/networks/${chain?.name}/proposal/${proposal.proposalId}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-4 pl-7 hover:text-highlight">
        <Link href={proposalLink} className="flex items-center gap-1">
          <div className="ml-1 mr-2 font-handjet text-xl text-highlight">{`#${proposal.proposalId}`}</div>
          <div className="text-base">{proposal.title}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-5 py-4 text-base hover:text-highlight">
        <Tooltip tooltip={proposal.type} direction="top">
          <Link href={proposalLink} className="flex justify-center">
            <div className="break-all text-center">{parseMessage(proposal.type)}</div>
          </Link>
        </Tooltip>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
        <Link href={proposalLink} className="flex justify-center">
          <div className="text-center">{results}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
        <Link href={proposalLink} className="flex justify-center">
          {proposal.votingEndTime && (
            <div className="text-center font-handjet text-lg">
              {new Date(proposal.votingEndTime).toDateString().split(' ').slice(1, 4).join(' ')},{' '}
              {new Date(proposal.votingEndTime).toTimeString().split(' ').slice(0, 2).join(' ')}
            </div>
          )}
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworkProposalItem;
