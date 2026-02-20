import { FC } from 'react';

import NetworkValidatorsItem from '@/app/networks/[name]/validators/network-validators-table/network-validators-item';
import TablePagination from '@/components/common/table/table-pagination';
import { SortDirection } from '@/server/types';
import chainService from '@/services/chain-service';

interface OwnProps {
  chainId: number | null;
  chainName: string;
  nodeStatus: string[];
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkValidatorsList: FC<OwnProps> = async ({ chainId, chainName, sort, perPage, nodeStatus, currentPage = 1 }) => {
  if (!chainId) return null;

  const isAztecNetwork = ['aztec', 'aztec-testnet'].includes(chainName);

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
        <NetworkValidatorsItem key={`${item.chainId}-${item.validatorId}`} item={item} isAztec={isAztecNetwork} />
      ))}
      <tr>
        <td colSpan={isAztecNetwork ? 10 : 9} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NetworkValidatorsList;
