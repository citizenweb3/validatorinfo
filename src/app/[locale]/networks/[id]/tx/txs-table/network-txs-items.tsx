import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  id: string;
  item: {
    typeOfTx: string;
    txHash: string;
    timeStamp: string;
    blockHeight: string;
  };
}

const NetworkTxsItem: FC<OwnProps> = ({ id, item }) => {
  const getSquareIcon = () => {
    switch (item.typeOfTx) {
      case 'Send':
        return icons.GreenSquareIcon;
      default:
        return icons.RedSquareIcon;
    }
  };

  const link = `/networks/${id}/tx/${item.txHash}`;

  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <Link href={link} className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getSquareIcon()} alt={`${item.typeOfTx}`} width={30} height={30} />
          </div>
          <div className="flex-grow text-center underline underline-offset-3">{cutHash({ value: item.txHash })}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.typeOfTx}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link href={link} className="flex justify-center">
          <div className="text-center text-base">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link href={link} className="flex justify-center">
          <div className="font-handjet text-lg text-center">{item.timeStamp}</div>
        </Link>
      </td>
    </tr>
  );
};

export default NetworkTxsItem;
