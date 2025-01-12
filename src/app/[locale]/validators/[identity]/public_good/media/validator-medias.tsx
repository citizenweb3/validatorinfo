import { FC } from 'react';

import ValidatorVotesList from '@/app/validators/[identity]/governance/validator-votes/validator-votes-list';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/services/validator-service';
import { PagesProps } from '@/types';
import ValidatorMediasList from '@/app/validators/[identity]/public_good/media/validator-medias-list';

interface OwnProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorMedias: FC<OwnProps> = async ({ perPage, sort, currentPage }) => {
  return (
    <div>
      <table className="my-4 w-full table-auto border-collapse">
        <ValidatorMediasList perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default ValidatorMedias;
