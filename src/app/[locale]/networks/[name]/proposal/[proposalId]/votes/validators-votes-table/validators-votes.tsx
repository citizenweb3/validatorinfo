import { FC } from 'react';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import ValidatorsVotesList
  from '@/app/networks/[name]/proposal/[proposalId]/votes/validators-votes-table/validators-votes-list';
import ValidatorsVotesFilters
  from '@/app/networks/[name]/proposal/[proposalId]/votes/validators-votes-table/validators-votes-filters';
import ValidatorsVotesSearch
  from '@/app/networks/[name]/proposal/[proposalId]/votes/validators-votes-table/validators-votes-search';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  chainName: string;
  proposalId: string;
  vote: string;
  search: string;
}

const ValidatorsVotes: FC<OwnProps> = async ({ page, perPage, sort, currentPage, chainName, proposalId, vote, search }) => {
  return (
    <div className="mt-4">
      <ValidatorsVotesFilters />
      <div className="mb-4">
        <div
          className="relative mx-1 mt-7 flex h-0.5 flex-grow justify-center border-white bg-gradient-to-r from-primary to-secondary shadow-line">
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -left-1 top-2/4 h-3 translate-y-[-52%] fill-primary"
          >
            <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
          </svg>
          <div>
            <ValidatorsVotesSearch chainName={chainName} proposalId={proposalId} />
          </div>
          <svg
            width="6"
            height="10"
            viewBox="0 0 6 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -right-1 top-2/4 h-3 translate-y-[-52%] rotate-180 fill-secondary"
          >
            <path d="M-2.18557e-07 5L6 0.669872L6 9.33013L-2.18557e-07 5Z" />
          </svg>
        </div>
      </div>
      <table className="w-full table-auto border-collapse mt-4">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Validator" sortField="moniker" defaultSelected />
          <TableHeaderItem page={page} name="Tx Hash" />
          <TableHeaderItem page={page} name="Answer" sortField="vote" />
          <TableHeaderItem page={page} name="Time" />
        </tr>
        </thead>
        <ValidatorsVotesList
          perPage={perPage}
          sort={sort}
          currentPage={currentPage}
          chainName={chainName}
          proposalId={proposalId}
          vote={vote}
          search={search}
        />
      </table>
    </div>
  );
};

export default ValidatorsVotes;
