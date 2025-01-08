import { FC } from 'react';

import ValidatorNetworksItem from '@/app/validators/[validatorIdentity]/networks/validator-networks/validator-networks-item';
import TablePagination from '@/components/common/table/table-pagination';
import ChainService from '@/services/chain-service';
import { SortDirection } from '@/services/validator-service';
import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import ValidatorVotesItem from '@/app/validators/[validatorIdentity]/governance/validator-votes/validator-votes-items';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorVotesList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  // const { chains: list, pages } = await ChainService.getAll(
  //   perPage * (currentPage - 1),
  //   perPage,
  //   sort.sortBy,
  //   sort.order,
  // );
  const pages = 1;

  return (
    <tbody>
    {validatorExample.votes.map((item) => (
      <ValidatorVotesItem key={item.proposalId} item={item} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default ValidatorVotesList;
