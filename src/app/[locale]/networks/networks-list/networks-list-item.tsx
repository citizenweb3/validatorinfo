import Link from 'next/link';
import { FC } from 'react';

import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import formatCash from '@/utils/format-cash';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  item: ChainWithParamsAndTokenomics;
}

const NetworksListItem: FC<OwnProps> = async ({ item }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12 mx-auto';
  const totalSupply = item.params?.coinDecimals && item.tokenomics?.totalSupply
    ? +item.tokenomics?.totalSupply / 10 ** item.params?.coinDecimals
    : undefined;

  const tokenPrice = await chainService.getTokenPriceByChainId(item.id);
  const fdv = (tokenPrice?.value && totalSupply) ? totalSupply * tokenPrice.value : 0;

  return (
    <tr className="group font-handjet hover:bg-bgHover ">
      <td
        className="group/avatar w-1/3 border-b border-black px-2 py-2 font-sfpro hover:text-highlight active:border-bgSt">
        <TableAvatar icon={item.logoUrl} name={item.prettyName} href={`/networks/${item.id}/overview`} />
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <div className="text-center">{item.params?.denom}</div>
      </td>
      <td className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt">
        <Tooltip tooltip={`$${fdv.toLocaleString()}`}>
          <div className="text-center">${formatCash(fdv)}</div>
        </Tooltip>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={'https://www.citizenweb3.com/about'} className={`${size}`} target="_blank">
          <div className={`${size} bg-web bg-contain bg-no-repeat hover:bg-web_h`} />
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={'https://github.com/citizenweb3/validatorinfo'} className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
      </td>
      <td className="border-b border-black px-2 py-2 active:border-bgSt">
        <Link href={'https://x.com/therealvalinfo'} className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </td>
    </tr>
  );
};

export default NetworksListItem;
