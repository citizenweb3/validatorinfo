import { FC } from 'react';

import ValidatorListItem from '@/app/main-validators/validator-list/validator-list-item/validator-list-item';
import TablePagination from '@/components/common/table/table-pagination';
import ChainService from '@/services/chain-service';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface OwnProps {
  filterChains: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const chains = await ChainService.getAll(0, 1000);
  const { validators: list, pages } = await ValidatorService.getAll(
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <ValidatorListItem key={item.identity} validator={item} chains={chains.chains} />
      ))}
      <tr>
        <td colSpan={10} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default ValidatorsList;
