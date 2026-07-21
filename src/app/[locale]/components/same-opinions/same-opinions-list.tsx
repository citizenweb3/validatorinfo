import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SameOpinionsItem from '@/components/same-opinions/same-opinions-item';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import voteService from '@/services/vote-service';

interface OwnProps {
  operatorAddress: string;
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const SameOpinionsList: FC<OwnProps> = async ({ operatorAddress, sort, perPage, currentPage = 1 }) => {
  const t = await getTranslations('SameOpinionsPage');

  const { validators, pages } = await voteService.getNodeSameOpinionValidators(
    operatorAddress,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  if (validators.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={4} className="py-8 text-center font-sfpro text-base text-highlight">
            {t('no matches')}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {validators.map((item) => (
        <SameOpinionsItem key={item.nodeId} item={item} />
      ))}
      <tr>
        <td colSpan={4} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default SameOpinionsList;
