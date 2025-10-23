import { FC } from 'react';

import ValidatorListItemGame from '@/app/main-validators/validator-list/validator-list-item/validator-list-item-game';
import ValidatorListItemDev from '@/app/main-validators/validator-list/validator-list-item/validators-list-item-dev';
import ValidatorsNextPagination from '@/app/main-validators/validator-list/validators-next-pagination';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import ChainService from '@/services/chain-service';
import validatorService from '@/services/validator-service';

interface OwnProps {
  ecosystems: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy?: string; order: SortDirection };
  mode?: 'game' | 'dev';
}

const ValidatorsList: FC<OwnProps> = async ({ sort, perPage, ecosystems, currentPage = 1, mode = 'game' }) => {
  const chains = await ChainService.getAll([], 0, 1000);
  const ItemComponent = mode === 'dev' ? ValidatorListItemDev : ValidatorListItemGame;
  const colSpan = mode === 'dev' ? 10 : 3;

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
          <ItemComponent key={item.id} validator={item} chains={chains.chains} />
        ))}
        <tr>
          <td colSpan={colSpan} className="pt-4">
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
        <ItemComponent key={item.id} validator={item} chains={chains.chains} />
      ))}
      <ValidatorsNextPagination />
    </tbody>
  );
};

export default ValidatorsList;
