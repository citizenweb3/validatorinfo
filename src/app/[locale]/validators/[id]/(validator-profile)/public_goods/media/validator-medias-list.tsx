import { FC } from 'react';

import ValidatorMediaItem from '@/app/validators/[id]/(validator-profile)/public_goods/media/validator-media-item';
import { validatorExample } from '@/app/validators/[id]/(validator-profile)/validatorExample';
import BaseTable from '@/components/common/table/base-table';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorMediasList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;
  return (
    <div>
      <BaseTable className="my-4">
        <tbody>
          {validatorExample.media.map((item) => (
            <ValidatorMediaItem key={item.name} item={item} />
          ))}
          <tr>
            <td colSpan={5} className="pt-4">
              <TablePagination pageLength={pages} />
            </td>
          </tr>
        </tbody>
      </BaseTable>
    </div>
  );
};

export default ValidatorMediasList;
