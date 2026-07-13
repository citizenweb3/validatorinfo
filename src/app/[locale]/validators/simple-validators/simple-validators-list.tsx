import { FC } from 'react';

import SimpleValidatorListItem from '@/app/validators/simple-validators/simple-validator-list-item';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import ChainService from '@/services/chain-service';
import validatorService from '@/services/validator-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  ecosystems: string[];
}

const SimpleValidatorsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, ecosystems }) => {
  // showAll=true so closed (unsupported) networks are in the lookup too — a validator's
  // nodes on them would otherwise resolve to undefined and drop out of Supported Assets.
  const chains = await ChainService.getAll([], 0, 1000, 'name', 'asc', true);
  const { validators: list, pages } = await validatorService.getAll(
    ecosystems,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <SimpleValidatorListItem key={item.id} validator={item} chains={chains.chains} />
      ))}
      <tr>
        <td colSpan={3} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default SimpleValidatorsList;
