import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import {
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';

interface OwnProps {
  item: SlashingEventsExampleInterface;
}

const SlashingEventsItem: FC<OwnProps> = ({ item }) => {
  return (
    <tr className="group cursor-pointer font-handjet text-lg hover:bg-bgHover">
      <td className="w-1/2 border-b border-black py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex w-full items-center">
          <Tooltip tooltip={'text'} direction={'top'}>
            <Image src={icons.Warning} alt="warning" width={40} height={40} className="shrink-0" />
          </Tooltip>
          <div className="flex flex-1 items-center justify-center text-center">
            {item.retroName.height.toLocaleString('en-En')} [{item.retroName.time}]
          </div>
        </Link>
      </td>
      <td className="w-1/2 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex items-center justify-center">
          <div className="flex items-center justify-center">
            {item.commits.token.toFixed(1)} [${item.commits.usd.toFixed(1)}]
          </div>
        </Link>
      </td>
    </tr>
  );
};

export default SlashingEventsItem;
