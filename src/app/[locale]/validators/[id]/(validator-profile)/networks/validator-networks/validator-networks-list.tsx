import { FC } from 'react';

import ValidatorNetworksItem from '@/app/validators/[id]/(validator-profile)/networks/validator-networks/validator-networks-item';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';

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
