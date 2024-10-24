import { FC } from 'react';

import SimpleValidatorListItem from '@/app/validators/simple-validators/simple-validator-list-item';
import TablePagination from '@/components/common/table/table-pagination';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const SimpleValidatorsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const { validators: list, pages } = await ValidatorService.getLite(
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <SimpleValidatorListItem key={item.identity} validator={item} />
      ))}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default SimpleValidatorsList;
