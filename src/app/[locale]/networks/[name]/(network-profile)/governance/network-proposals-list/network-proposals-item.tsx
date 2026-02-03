import { Chain, Proposal, ProposalStatus } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import icons from '@/components/icons';
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

const NetworkProposalItem: FC<OwnProps> = ({ proposal, chain }) => {
  const getStatusIcon = () => {
    if (proposal.status === ProposalStatus.PROPOSAL_STATUS_PASSED) return icons.GreenSquareIcon;
    if (proposal.status === ProposalStatus.PROPOSAL_STATUS_REJECTED ||
        proposal.status === ProposalStatus.PROPOSAL_STATUS_FAILED) return icons.RedSquareIcon;
    return icons.YellowSquareIcon;
  };

  const proposalLink = `/networks/${chain?.name}/proposal/${proposal.proposalId}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/3 py-4 pl-4 hover:text-highlight">
        <Link href={proposalLink} className="flex items-center gap-2">
          <Image src={getStatusIcon()} alt="proposal status" width={26} height={26} />
          <div className="font-handjet text-xl text-highlight">{`#${proposal.proposalId}`}</div>
          <div className="text-base">{proposal.title}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/3 px-5 py-4 text-base hover:text-highlight">
        <Tooltip tooltip={proposal.type} direction="top">
          <div className="flex justify-center">
            <div className="break-all text-center">{parseMessage(proposal.type)}</div>
          </div>
        </Tooltip>
      </BaseTableCell>
      <BaseTableCell className="w-1/3 py-4 text-base hover:text-highlight">
        <div className="flex justify-center">
          {proposal.votingEndTime && (
            <div className="text-center font-handjet text-lg">
              {new Date(proposal.votingEndTime).toDateString().split(' ').slice(1, 4).join(' ')},{' '}
              {new Date(proposal.votingEndTime).toTimeString().split(' ').slice(0, 2).join(' ')}
            </div>
          )}
        </div>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworkProposalItem;
