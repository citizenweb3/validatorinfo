import { FC } from 'react';

import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import { getTranslations } from 'next-intl/server';
import SubTitle from '@/components/common/sub-title';
import NetworkAppsList from '@/app/networks/[id]/(network-profile)/dev/apps-list/apps-list';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkApps: FC<OwnProps> = async ({ page, perPage, sort, currentPage }) => {
  const t = await getTranslations(page);

  return (
    <div className="mt-10">
      <SubTitle text={t('Subtitle')} />
      <table className="w-full table-auto border-collapse mt-4">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Name" sortField="name" defaultSelected />
          <TableHeaderItem page={page} name="Links" sortField="links" />
          <TableHeaderItem page={page} name="Users" sortField="users" />
          <TableHeaderItem page={page} name="WAU" sortField="wau" />
          <TableHeaderItem page={page} name="Capital" sortField="capital" />
        </tr>
        </thead>
        <NetworkAppsList perPage={perPage} sort={sort} currentPage={currentPage} />
      </table>
    </div>
  );
};

export default NetworkApps;
