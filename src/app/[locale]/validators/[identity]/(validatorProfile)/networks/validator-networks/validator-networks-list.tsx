import { FC } from 'react';

import ValidatorNetworksItem from '@/app/validators/[identity]/(validatorProfile)/networks/validator-networks/validator-networks-item';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface OwnProps {
  identity: string;
  sort: { sortBy: string; order: SortDirection };
}

const ValidatorNetworksList: FC<OwnProps> = async ({ identity, sort }) => {
  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(
    identity,
    sort.sortBy,
    sort.order,
  );

  return (
    <tbody>
      {list.map((item) => (
        <ValidatorNetworksItem key={item.chainId + item.consensus_pubkey} item={item} />
      ))}
    </tbody>
  );
};

export default ValidatorNetworksList;
