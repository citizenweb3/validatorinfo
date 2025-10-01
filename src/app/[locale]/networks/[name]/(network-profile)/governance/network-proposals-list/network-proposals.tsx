import { FC } from 'react';

import TableHeaderItem from '@/components/common/table/table-header-item';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';
import NetworkProposalsList from '@/app/networks/[name]/(network-profile)/governance/network-proposals-list/network-proposals-list';
import { getTranslations } from 'next-intl/server';
import SubTitle from '@/components/common/sub-title';
import { Chain } from '@prisma/client';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  chain: Chain | null;
}

const NetworkProposals: FC<OwnProps> = async ({ page, perPage, sort, currentPage, chain }) => {
  const t = await getTranslations('NetworkGovernance');

  return (
    <div className="mt-10">
      <SubTitle text={t('Past Proposals List')} />
      <table className="w-full table-auto border-collapse mt-4">
        <thead>
        <tr className="bg-table_header">
          <TableHeaderItem page={page} name="Title" sortField="proposalId" />
          <TableHeaderItem page={page} name="Type" sortField="type" />
          <TableHeaderItem page={page} name="Vote" sortField="finalTallyResult" />
          <TableHeaderItem page={page} name="Voting Ended" sortField="votingEndTime" defaultSelected />
        </tr>
        </thead>
        <NetworkProposalsList perPage={perPage} sort={sort} currentPage={currentPage} chain={chain} />
      </table>
    </div>
  );
};

export default NetworkProposals;
