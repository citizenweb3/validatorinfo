import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';

import ValidatorComparisonTable from './validator-comparison-table';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  ecosystems: string[];
  commissionMin: number;
  commissionMax: number;
  uptimeMin: number;
  activeOnly: boolean;
}

const SimpleValidatorsList: FC<OwnProps> = async ({
  sort,
  perPage,
  currentPage = 1,
  ecosystems,
  commissionMin,
  commissionMax,
  uptimeMin,
  activeOnly,
}) => {
  const { validators: list, pages } = await validatorService.getAllWithStats(
    ecosystems,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <div>
      <ValidatorComparisonTable
        validators={list}
        sortBy={sort.sortBy}
        order={sort.order}
        ecosystems={ecosystems}
        commissionMin={commissionMin}
        commissionMax={commissionMax}
        uptimeMin={uptimeMin}
        activeOnly={activeOnly}
      />
      <div className="pt-4">
        <TablePagination pageLength={pages} />
      </div>
    </div>
  );
};

export default SimpleValidatorsList;
