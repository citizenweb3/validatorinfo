import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  name: string;
  item: {
    typeOfTx: string;
    hash: string;
    timeStamp: string;
    blockHeight: string;
  };
}

const NetworkTxsItem: FC<OwnProps> = ({ name, item }) => {
  const getSquareIcon = () => {
    switch (item.typeOfTx) {
      case 'Send':
        return icons.GreenSquareIcon;
      default:
        return icons.RedSquareIcon;
    }
  };

  const link = `/networks/${name}/tx/${item.hash}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
        <Link href={link} className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getSquareIcon()} alt={`${item.typeOfTx}`} width={30} height={30} />
          </div>
          <div className="flex-grow font-handjet text-lg text-center underline underline-offset-3">{cutHash({ value: item.hash })}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-sfpro text-base">{item.typeOfTx}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="font-sfpro text-base text-center">{item.timeStamp}</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworkTxsItem;
