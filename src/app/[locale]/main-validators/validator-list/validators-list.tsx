import { FC } from 'react';

import ValidatorListItem from '@/app/main-validators/validator-list/validator-list-item/validator-list-item';
import TablePagination from '@/components/common/table/table-pagination';
import ChainService from '@/services/chain-service';
import validatorService, { SortDirection } from '@/services/validator-service';

interface OwnProps {
  ecosystems: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy?: string; order: SortDirection };
}

const ValidatorsList: FC<OwnProps> = async ({ sort, perPage, ecosystems, currentPage = 1 }) => {
  const chains = await ChainService.getAll([], 0, 1000);
  if (sort.sortBy) {
    const { validators: list, pages } = await validatorService.getAll(
      ecosystems,
      perPage * (currentPage - 1),
      perPage,
      sort?.sortBy,
      sort.order,
    );

    return (
      <tbody>
        {list.map((item) => (
          <ValidatorListItem key={item.id} validator={item} chains={chains.chains} />
        ))}
        <tr>
          <td colSpan={10} className="pt-4">
            <TablePagination pageLength={pages} />
          </td>
        </tr>
      </tbody>
    );
  }

  const { validators: list } = await validatorService.getRandom(ecosystems, perPage);

  return (
    <tbody>
      {list.map((item) => (
        <ValidatorListItem key={item.id} validator={item} chains={chains.chains} />
      ))}
    </tbody>
  );
};

export default ValidatorsList;
