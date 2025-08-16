import { FC } from 'react';
import { Node } from '@prisma/client';
import _ from 'lodash';
import formatCash from '@/utils/format-cash';
import Link from 'next/link';
import Tooltip from '@/components/common/tooltip';
import cutHash from '@/utils/cut-hash';
import Image from 'next/image';
import icons from '@/components/icons';
import colorStylization from '@/utils/color-stylization';
import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';


interface OwnProps {
  item: Node & { chain: ChainWithParams };
}

const NetworksListItem: FC<OwnProps> = ({ item }) => {
  const tokenDelegatorShares = item.chain.params?.coinDecimals
    ? Number(item.delegatorShares) / 10 ** item.chain.params?.coinDecimals
    : undefined;

  const validatorLink = item.validatorId
    ? `/validators/${item.validatorId}/${item.operatorAddress}/validator_passport/authz/withdraw_rewards`
    : '';

  return (
    <tr className="font-handjet">
      <td
        className="border-b border-black py-2 font-handjet text-lg active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <div className="flex">
          <Image
            src={item?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
            alt={'node status'}
            width={20}
            height={20}
          />
          <Tooltip tooltip={item.operatorAddress} className={'font-normal text-base'}>
            <div className="ml-4">{
              cutHash({ value: item.operatorAddress, cutLength: 10 })}
            </div>
          </Tooltip>
          <div className="pl-4">
            <CopyButton value={item.operatorAddress} />
          </div>
        </div>
      </td>
      <td
        className="w-[20%] border-b border-black py-2 font-sfpro text-base active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <div
          className="text-center break-words break-all">{item.moniker && !item.moniker.startsWith('0x') ? item.moniker : '-'}</div>
      </td>
      <td
        className="w-[20%] border-b border-black py-2 font-sfpro text-base active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <Link href={validatorLink}>
          <div className="text-center break-words break-all">{item.validatorId ? item.moniker : '-'}</div>
        </Link>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <Link href={`/validators?p=1&ecosystems=${item.chain.ecosystem}`}>
          <div className="text-center">{_.capitalize(item.chain.ecosystem)}</div>
        </Link>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <Link href={`/networks/${item.chainId}/overview`}>
          <div className="text-center">{item.chain.prettyName}</div>
        </Link>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-handjet text-lg active:border-bgSt hover:bg-bgHover hover:text-highlight">
        <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
          <div className="text-center">
            {tokenDelegatorShares ? formatCash(tokenDelegatorShares) : ''}
          </div>
        </Tooltip>
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt hover:bg-bgHover hover:text-highlight">
        {item.uptime !== undefined && item.uptime !== null ? (
          <Tooltip tooltip={`Per ${item.chain.params?.blocksWindow?.toLocaleString()} blocks`}>
            <div className="text-center" style={{ color: colorStylization.uptime(item.uptime) }}>
              {item.uptime.toFixed(2)}
            </div>
          </Tooltip>
        ) : (
          <div className="text-center">
            -
          </div>
        )}
      </td>
      <td
        className="border-b border-black px-2 py-2 font-sfpro text-base active:border-bgSt hover:bg-bgHover hover:text-highlight">
        {item.missedBlocks !== undefined && item.missedBlocks !== null ? (
          <Tooltip tooltip={`Per ${item.chain.params?.blocksWindow?.toLocaleString()} blocks`}>
            <div className="text-center" style={{ color: colorStylization.missedBlocks(item.missedBlocks) }}>
              {item.missedBlocks}
            </div>
          </Tooltip>
        ) : (
          <div className="text-center">
            -
          </div>
        )}
      </td>
    </tr>
  );
};

export default NetworksListItem;
