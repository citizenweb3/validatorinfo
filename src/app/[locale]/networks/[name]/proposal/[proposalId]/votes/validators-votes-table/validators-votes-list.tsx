import Link from 'next/link';
import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import ValidatorsVotesItem
  from '@/app/networks/[name]/proposal/[proposalId]/votes/validators-votes-table/validators-votes-item';
import {
  validatorsVotes,
} from '@/app/networks/[name]/proposal/[proposalId]/votes/validators-votes-table/validatorsVotesExample';
import voteService, { ProposalValidatorsVotes } from '@/services/vote-service';
import AztecVoteEventService from '@/services/aztec-vote-event-service';
import { isAztecNetwork } from '@/utils/chain-utils';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainName: string;
  proposalId: string;
  vote: string;
  search: string;
}

const ValidatorsVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, chainName, proposalId, vote, search }) => {
  let votesList: ProposalValidatorsVotes[] = [];
  let pages = 1;

  if (isAztecNetwork(chainName)) {
    const votingType = await AztecVoteEventService.getProposalVotingType(chainName, proposalId);

    if (votingType === 'signals') {
      return (
        <tbody>
          <tr>
            <td colSpan={4} className="pt-8 pb-4 text-center text-lg">
              <p className="mb-2">This is a payload in signaling phase.</p>
              <Link
                href={`/networks/${chainName}/proposal/${proposalId}/signals`}
                className="text-highlight underline hover:text-highlight/80"
                aria-label="View sequencer signals for this proposal"
              >
                View sequencer signals
              </Link>
            </td>
          </tr>
        </tbody>
      );
    }

    // For 'votes' type (proposal stage), GSE votes aggregated - cannot show individual votes
    return (
      <tbody>
        <tr>
          <td colSpan={4} className="pt-8 pb-4 text-center text-lg">
            <p className="mb-2">Token votes are aggregated by the GSE contract.</p>
            <p className="text-sm text-gray-500">
              Individual validator votes cannot be tracked during the proposal voting stage.
              See vote totals above.
            </p>
          </td>
        </tr>
      </tbody>
    );
  } else if (chainName === 'namada' || chainName === 'namada-testnet') {
    const result = await voteService.getProposalValidatorsVotes(
      chainName,
      proposalId,
      perPage * (currentPage - 1),
      perPage,
      sort.sortBy,
      sort.order,
      vote,
      parseInt(search)
    );
    votesList = result.votes;
    pages = result.pages;
  } else {
    votesList = validatorsVotes;
  }

  return (
    <>
      {votesList.length > 0 ? (
        <tbody>
        {votesList.map((item) => (
          <ValidatorsVotesItem key={item.validator.id} item={item} />
        ))}
        <tr>
          <td colSpan={4} className="pt-4">
            <TablePagination pageLength={pages} isScroll={false} />
          </td>
        </tr>
        </tbody>
      ) : (
        <tbody>
        <tr>
          <td colSpan={4} className="pt-8 pb-4 text-center text-lg">
            No votes yet
          </td>
        </tr>
        </tbody>
      )}
    </>
  );
};

export default ValidatorsVotesList;
