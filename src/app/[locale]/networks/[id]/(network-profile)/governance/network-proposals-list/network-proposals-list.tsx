import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import NetworkProposalsItem
  from '@/app/networks/[id]/(network-profile)/governance/network-proposals-list/network-proposals-item';
import proposalService from '@/services/proposal-service';
import { getTranslations } from 'next-intl/server';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  chainId: number;
}

const NetworkProposalsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, chainId }) => {
  const t = await getTranslations('NetworkGovernance');
  const { proposals: list, pages } = await proposalService.getPastProposalsByChainId(
    chainId,
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
          <NetworkProposalsItem key={item.proposalId} proposal={item} />
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
