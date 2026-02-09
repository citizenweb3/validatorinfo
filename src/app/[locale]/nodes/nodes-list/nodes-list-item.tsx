import _ from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';
import { NodeWithChainAndConsensus } from '@/services/node-service';
import colorStylization from '@/utils/color-stylization';
import cutHash from '@/utils/cut-hash';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  item: NodeWithChainAndConsensus;
}

const NetworksListItem: FC<OwnProps> = async ({ item }) => {
  const tokenDelegatorShares =
    item.chain.params?.coinDecimals != null
      ? Number(item.delegatorShares) / 10 ** item.chain.params?.coinDecimals
      : undefined;

  const validatorLink = item.validatorId
    ? `/validators/${item.validatorId}/networks`
    : '';

  const totalSlots = item.consensusData?.totalSlots ?? null;

  const chainsWithSlots = ['ethereum', 'ethereum-sepolia', 'aztec', 'aztec-testnet'];

  return (
    <BaseTableRow>
      <BaseTableCell className="py-2 font-handjet text-lg hover:text-highlight">
        <div className="flex">
          <Image
            src={item?.jailed ? icons.RedSquareIcon : icons.GreenSquareIcon}
            alt={'node status'}
            width={20}
            height={20}
          />
          <Tooltip tooltip={item.operatorAddress} className={'text-base font-normal'}>
            <div className="ml-4">{cutHash({ value: item.operatorAddress, cutLength: 10 })}</div>
          </Tooltip>
          <div className="pl-4">
            <CopyButton value={item.operatorAddress} />
          </div>
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-[20%] py-2 font-sfpro text-base hover:text-highlight">
        <div className="break-words break-all text-center">
          {item.moniker && !item.moniker.startsWith('0x') ? item.moniker : '-'}
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-[20%] py-2 font-sfpro text-base hover:text-highlight">
        <Link href={validatorLink}>
          <div className="break-words break-all text-center">{item.validatorId ? item.moniker : '-'}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={`/validators?p=1&ecosystems=${item.chain.ecosystem}`}>
          <div className="text-center">{_.capitalize(item.chain.ecosystem)}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        <Link href={`/networks/${item.chain.name}/overview`}>
          <div className="text-center">{item.chain.prettyName}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-handjet text-lg hover:text-highlight">
        <Tooltip tooltip={tokenDelegatorShares?.toLocaleString() ?? ''}>
          <div className="text-center">{tokenDelegatorShares ? formatCash(tokenDelegatorShares) : ''}</div>
        </Tooltip>
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        {item.uptime !== undefined && item.uptime !== null ? (
          <Tooltip
            tooltip={`Per
          ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()}
          ${chainsWithSlots.includes(item.chain.name) ? 'slots' : 'blocks'}
          `}
          >
            <div className="text-center" style={{ color: colorStylization.uptime(item.uptime) }}>
              {item.uptime.toFixed(2)}
            </div>
          </Tooltip>
        ) : (
          <div className="text-center">-</div>
        )}
      </BaseTableCell>
      <BaseTableCell className="px-2 py-2 font-sfpro text-base hover:text-highlight">
        {item.missedBlocks !== undefined && item.missedBlocks !== null ? (
          <Tooltip
            tooltip={`Per
          ${totalSlots ? totalSlots.toLocaleString() : item.chain.params?.blocksWindow?.toLocaleString()}
          ${chainsWithSlots.includes(item.chain.name) ? 'slots' : 'blocks'}
          `}
          >
            <div className="text-center">{item.missedBlocks}</div>
          </Tooltip>
        ) : (
          <div className="text-center">-</div>
        )}
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworksListItem;
