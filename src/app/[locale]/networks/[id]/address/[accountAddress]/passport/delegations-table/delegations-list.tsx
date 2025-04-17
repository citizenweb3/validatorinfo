import { FC } from 'react';
import { delegationsExample } from '@/app/networks/[id]/address/[accountAddress]/passport/delegations-table/delegationsExample';
import DelegationsItem from '@/app/networks/[id]/address/[accountAddress]/passport/delegations-table/delegations-item';

interface OwnProps {
  chainId: number;
}

const DelegationsList: FC<OwnProps> = async ({ chainId }) => {

  return (
    <tbody>
    {delegationsExample.map((item) => (
      <DelegationsItem key={item.validatorId} item={item} chainId={chainId} />
    ))}
    </tbody>
  );
};

export default DelegationsList;
