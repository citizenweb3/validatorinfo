import { Proposal } from '@prisma/client';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';
import { parseMessage } from '@/utils/parse-proposal-message';

interface OwnProps {
  proposal: Proposal;
}

const NetworkProposalItem: FC<OwnProps> = ({ proposal }) => {
  const getFinalResult = (finalTallyResult: any): string => {
    try {
      const tally = JSON.parse(finalTallyResult);
      const yesCount = Number(tally.yes_count);
      const noCount = Number(tally.no_count);
      const abstainCount = Number(tally.abstain_count);
      const noWithVetoCount = Number(tally.no_with_veto_count);

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

  const proposalLink = `/networks/${proposal.chainId}/proposal/${proposal.proposalId}`;

  return (
    <tr className="cursor-pointer hover:bg-bgHover">
      <td className="w-1/4 border-b border-black py-4 pl-7 hover:text-highlight active:border-bgSt">
        <Link href={proposalLink} className="flex items-center gap-1">
          <div className="ml-1 mr-2 font-handjet text-xl text-highlight">{`#${proposal.proposalId}`}</div>
          <div className="text-base">{proposal.title}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-5 py-4 text-base hover:text-highlight active:border-bgSt">
        <Tooltip tooltip={proposal.type} direction="top">
          <Link href={proposalLink} className="flex justify-center">
            <div className="break-all text-center">{parseMessage(proposal.type)}</div>
          </Link>
        </Tooltip>
      </td>
      <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={proposalLink} className="flex justify-center">
          <div className="text-center">{getFinalResult(proposal.finalTallyResult)}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={proposalLink} className="flex justify-center">
          {proposal.votingEndTime && (
            <div className="text-center font-handjet text-lg">
              {new Date(proposal.votingEndTime).toDateString().split(' ').slice(1, 4).join(' ')},{' '}
              {new Date(proposal.votingEndTime).toTimeString().split(' ').slice(0, 2).join(' ')}
            </div>
          )}
        </Link>
      </td>
    </tr>
  );
};

export default NetworkProposalItem;
