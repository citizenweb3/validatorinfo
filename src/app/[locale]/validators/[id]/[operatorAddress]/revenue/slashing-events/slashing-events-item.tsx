import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import {
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import { AztecSlashingEventDisplay } from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/aztec-slashing-types';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';

interface OwnProps {
  item: SlashingEventsExampleInterface | AztecSlashingEventDisplay;
}

const SlashingEventsItem: FC<OwnProps> = ({ item }) => {
  const isAztecData = 'transactionHash' in item;

  if (isAztecData) {
    const aztecItem = item as AztecSlashingEventDisplay;
    return (
      <tr className="group cursor-pointer font-handjet text-lg hover:bg-bgHover">
        <td className="w-1/2 border-b border-black py-4 hover:text-highlight active:border-bgSt">
          <a
            href={`https://etherscan.io/block/${aztecItem.blockInfo.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center"
          >
            <Tooltip tooltip={'Slashing event'} direction={'top'}>
              <Image
                src={icons.Warning}
                alt="warning"
                width={40}
                height={40}
                className="shrink-0"
              />
            </Tooltip>
            <div className="flex flex-1 items-center justify-center text-center">
              {parseInt(aztecItem.blockInfo.number).toLocaleString('en-En')} [{aztecItem.blockInfo.time}]
            </div>
          </a>
        </td>

        <td className="w-1/2 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
          <a
            href={aztecItem.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <div className="flex items-center justify-center font-semibold text-red-600">
              {aztecItem.slashAmount.tokens.toFixed(1)}{' '}
              {aztecItem.slashAmount.usd > 0 && (
                <span className="ml-1 text-gray-500">
                  [${aztecItem.slashAmount.usd.toFixed(1)}]
                </span>
              )}
            </div>
          </a>
        </td>
      </tr>
    );
  }

  const mockItem = item as SlashingEventsExampleInterface;
  return (
    <tr className="group cursor-pointer font-handjet text-lg hover:bg-bgHover">
      <td className="w-1/2 border-b border-black py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex w-full items-center">
          <Tooltip tooltip={'text'} direction={'top'}>
            <Image src={icons.Warning} alt="warning" width={40} height={40} className="shrink-0" />
          </Tooltip>
          <div className="flex flex-1 items-center justify-center text-center">
            {mockItem.retroName.height.toLocaleString('en-En')} [{mockItem.retroName.time}]
          </div>
        </Link>
      </td>
      <td className="w-1/2 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          <div className="flex items-center justify-center">
            {mockItem.commits.token.toFixed(1)} [${mockItem.commits.usd.toFixed(1)}]
          </div>
        </Link>
      </td>
    </tr>
  );
};

export default SlashingEventsItem;
