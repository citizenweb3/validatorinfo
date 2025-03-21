import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import NetworkProposalsItem from '@/app/networks/[id]/(network-profile)/governance/network-proposals-list/network-proposals-item';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkProposalsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const pages = 1;

  return (
    <tbody>
    {networkProfileExample.proposalsList.map((item) => (
      <NetworkProposalsItem key={item.proposalId} item={item} />
    ))}
    <tr>
      <td colSpan={5} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default NetworkProposalsList;
