import { FC } from 'react';

import SimpleValidatorsList from '@/app/validators/simple-validators/simple-validators-list';
import ListFilters from '@/components/common/list-filters/list-filters';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

import ValidatorFilterPanel from './validator-filter-panel';

interface OwnProps extends PagesProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  ecosystems: string[];
  commissionMin: number;
  commissionMax: number;
  uptimeMin: number;
  activeOnly: boolean;
}

const SimpleValidators: FC<OwnProps> = async ({
  perPage,
  sort,
  currentPage,
  ecosystems,
  commissionMin,
  commissionMax,
  uptimeMin,
  activeOnly,
}) => {
  return (
    <div>
      <ListFilters perPage={perPage} selectedEcosystems={ecosystems} isEcosystems />
      <ValidatorFilterPanel
        selectedEcosystems={ecosystems}
        commissionMin={commissionMin}
        commissionMax={commissionMax}
        uptimeMin={uptimeMin}
        activeOnly={activeOnly}
      />
      <div>
        <SimpleValidatorsList
          perPage={perPage}
          sort={sort}
          currentPage={currentPage}
          ecosystems={ecosystems}
          commissionMin={commissionMin}
          commissionMax={commissionMax}
          uptimeMin={uptimeMin}
          activeOnly={activeOnly}
        />
      </div>
    </div>
  );
};

export default SimpleValidators;
