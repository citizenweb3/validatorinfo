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

    if (votingType === 'votes') {
      return (
        <tbody>
          <tr>
            <td colSpan={4} className="pt-8 pb-4 text-center text-lg">
              Token votes are aggregated by the GSE contract. See vote totals above.
            </td>
          </tr>
        </tbody>
      );
    }

    const result = await AztecVoteEventService.getProposalVotersForDisplay(
      chainName,
      proposalId,
      perPage * (currentPage - 1),
      perPage,
      sort.sortBy,
      sort.order,
      vote,
      search
    );
    votesList = result.votes;
    pages = result.pages;
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
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
        </tr>
        </tbody>
      )}
    </>

  );
};

export default ValidatorsVotesList;
