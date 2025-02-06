import { FC } from 'react';

import ValidatorNetworksItem from '@/app/validators/[id]/networks/validator-networks/validator-networks-item';
import validatorService, { SortDirection } from '@/services/validator-service';

interface OwnProps {
  id: number;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorNetworksList: FC<OwnProps> = async ({ id, sort }) => {
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(
    id,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <ValidatorNetworksItem key={item.chainId + item.consensusPubkey} item={item} />
      ))}
    </tbody>
  );
};

export default ValidatorNetworksList;
