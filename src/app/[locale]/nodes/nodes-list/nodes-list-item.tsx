import { FC } from 'react';
import { Chain, Node } from '@prisma/client';
import _ from 'lodash';
import formatCash from '@/utils/format-cash';
import Link from 'next/link';
import Tooltip from '@/components/common/tooltip';


interface OwnProps {
  item: Node & { chain: Chain };
}

const NetworksListItem: FC<OwnProps> = ({ item }) => {
  const tokenDelegatorShares = Number(item.delegatorShares) / 10 ** item.chain.coinDecimals;

  return (
    <tr className="group font-handjet hover:bg-bgHover hover:text-highlight">
      <td className="border-b border-black w-2/5 px-2 py-2 font-handjet text-lg active:border-bgSt">
        <Link href={`/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`}>
          <div className="ml-4">{item.operatorAddress}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 w-1/5 py-2 font-sfpro text-base active:border-bgSt">
        <Link href={`/validators?p=1&ecosystems=${item.chain.ecosystem}`}>
          <div className="text-center">{_.capitalize(item.chain.ecosystem)}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 w-1/5 font-sfpro text-base active:border-bgSt">
        <Link href={`/networks/${item.chainId}/overview`}>
          <div className="text-center">{item.chain.prettyName}</div>
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 w-1/5 font-handjet text-lg active:border-bgSt">
        <Tooltip tooltip={tokenDelegatorShares.toLocaleString()}>
          <div className="text-center">{formatCash(tokenDelegatorShares)}</div>
        </Tooltip>
      </td>
    </tr>
  );
};

export default NetworksListItem;
