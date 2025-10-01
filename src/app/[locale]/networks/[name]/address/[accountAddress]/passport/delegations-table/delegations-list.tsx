import { FC } from 'react';
import { delegationsExample } from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegationsExample';
import DelegationsItem from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegations-item';

interface OwnProps {
  chainName: string;
}

const DelegationsList: FC<OwnProps> = async ({ chainName }) => {

  return (
    <tbody>
    {delegationsExample.map((item) => (
      <DelegationsItem key={item.validatorId} item={item} chainName={chainName} />
    ))}
    </tbody>
  );
};

export default DelegationsList;
