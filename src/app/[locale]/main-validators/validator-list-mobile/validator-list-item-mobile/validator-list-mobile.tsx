import { FC } from 'react';

import ValidatorListItem from '@/app/main-validators/validator-list/validator-list-item/validator-list-item';
import ValidatorsNextPagination from '@/app/main-validators/validator-list/validators-next-pagination';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import ChainService from '@/services/chain-service';
import validatorService from '@/services/validator-service';
import ValidatorListItemMobile from '@/app/main-validators/validator-list-mobile/validator-list-item-mobile/validator-list-item-moblie';

interface OwnProps {
  ecosystems: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy?: string; order: SortDirection };
}

const ValidatorsListMobile: FC<OwnProps> = async ({ sort, perPage, ecosystems, currentPage = 1 }) => {
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
        <ValidatorListItemMobile key={item.id} validator={item} chains={chains.chains} />
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
      <ValidatorListItemMobile key={item.id} validator={item} chains={chains.chains} />
    ))}
    <ValidatorsNextPagination />
    </tbody>
  );
};

export default ValidatorsListMobile;
