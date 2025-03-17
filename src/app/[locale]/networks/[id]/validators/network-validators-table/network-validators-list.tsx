import { FC } from 'react';
import chainService from '@/services/chain-service';
import NetworkValidatorsItem from '@/app/networks/[id]/validators/network-validators-table/network-validators-item';
import { SortDirection } from '@/server/types';
import TablePagination from '@/components/common/table/table-pagination';

interface OwnProps {
  chainId: number;
  nodeStatus: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkValidatorsList: FC<OwnProps> = async ({ chainId, sort, perPage, nodeStatus, currentPage = 1 }) => {
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
