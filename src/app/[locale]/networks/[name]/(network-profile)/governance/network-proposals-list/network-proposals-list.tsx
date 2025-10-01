import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import NetworkProposalsItem
  from '@/app/networks/[name]/(network-profile)/governance/network-proposals-list/network-proposals-item';
import proposalService from '@/services/proposal-service';
import { Chain } from '@prisma/client';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chain: Chain | null;
}

const NetworkProposalsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, chain }) => {
  const { proposals: list, pages } = await proposalService.getPastProposalsByChainId(
    chain?.id ?? 1,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <>
      {list.length > 0 ? (
        <tbody>
        {list.map((item) => (
          <NetworkProposalsItem key={item.proposalId} proposal={item} chain={chain} />
        ))}
        <tr>
          <td colSpan={5} className="pt-4">
            <TablePagination pageLength={pages} />
          </td>
        </tr>
        </tbody>
      ) : (
        <tbody>
        <tr>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
          <td className="text-center text-lg pt-4">
            -
          </td>
        </tr>
        </tbody>
      )
      }
    </>


  );
};

export default NetworkProposalsList;
