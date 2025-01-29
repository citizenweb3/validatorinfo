import { FC } from 'react';

import ValidatorMediaItem from '@/app/validators/[identity]/(validatorProfile)/public_goods/media/validator-media-item';
import { validatorExample } from '@/app/validators/[identity]/(validatorProfile)/validatorExample';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/services/validator-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorMediasList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;
  return (
    <div>
      <table className="my-4 w-full table-auto border-collapse">
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
      </table>
    </div>
  );
};

export default ValidatorMediasList;
