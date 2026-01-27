import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  name: string;
  item: {
    hash: string;
    height: string | number;
    timestamp: string;
    finalizationStatus: number;
  };
}

const NetworkBlocksItem: FC<OwnProps> = ({ name, item }) => {
  const getStatusIcon = () => {
    return item.finalizationStatus === 0 ? icons.YellowSquareIcon : icons.GreenSquareIcon;
  };

  const getStatus = () => {
    return item.finalizationStatus === 0 ? 'Not Finalized' : 'Finalized';
  };

  const link = `/networks/${name}/blocks/${item.hash}`;

  const heightValue = typeof item.height === 'string' ? parseInt(item.height, 10) : item.height;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getStatusIcon()} alt={getStatus()} width={30} height={30} />
          </div>
          <div className="underline-offset-3 flex-grow text-center font-handjet text-lg underline">
            {cutHash({
              value: item.hash,
              cutLength: 12,
            })}
          </div>
        </Link>
      </BaseTableCell>

      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{heightValue.toLocaleString('ru-RU')}</div>
        </Link>
      </BaseTableCell>

      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-sfpro text-base">{item.timestamp}</div>
        </Link>
      </BaseTableCell>

      <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="flex-shrink-0">
            <div className="underline-offset-3 text-center font-handjet text-lg">{getStatus()}</div>
          </div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworkBlocksItem;
