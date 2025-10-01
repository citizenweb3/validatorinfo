import { FC } from 'react';

import NetworkValidatorsItem from '@/app/networks/[name]/validators/network-validators-table/network-validators-item';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import chainService from '@/services/chain-service';

interface OwnProps {
  chainId: number | null;
  nodeStatus: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkValidatorsList: FC<OwnProps> = async ({ chainId, sort, perPage, nodeStatus, currentPage = 1 }) => {
  if (!chainId) return null;

  const { validators: list, pages } = await chainService.getChainValidatorsWithNodes(
    chainId,
    nodeStatus,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <NetworkValidatorsItem key={item.chainId + item.consensusPubkey} item={item} />
      ))}
      <tr>
        <td colSpan={8} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NetworkValidatorsList;
