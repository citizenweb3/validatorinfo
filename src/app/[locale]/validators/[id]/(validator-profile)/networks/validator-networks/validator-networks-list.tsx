import { FC } from 'react';

import ValidatorNetworksItem
  from '@/app/validators/[id]/(validator-profile)/networks/validator-networks/validator-networks-item';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';
import TablePagination from '@/components/common/table/table-pagination';

interface OwnProps {
  id: number;
  ecosystems: string[];
  nodeStatus: string[];
  sort: { sortBy: string; order: SortDirection };
  currentPage?: number;
  perPage: number;
}

const ValidatorNetworksList: FC<OwnProps> = async ({ id, ecosystems, nodeStatus, sort, currentPage = 1, perPage }) => {
  const { validatorNodesWithChainData: list, pages } = await validatorService.getValidatorNodesWithChains(
    id,
    ecosystems,
    nodeStatus,
    perPage * (currentPage - 1),
    perPage,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
    {list.map((item) => (
      <ValidatorNetworksItem key={item.chainId + item.consensusPubkey} item={item} />
    ))}
    <tr>
      <td colSpan={11} className="pt-4">
        <TablePagination pageLength={pages} />
      </td>
    </tr>
    </tbody>
  );
};

export default ValidatorNetworksList;
