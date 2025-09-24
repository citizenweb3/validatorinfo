import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';
import CopyButton from '@/components/common/copy-button';

interface OwnProps {
  item: {
    typeOfTx: string;
    txHash: string;
    timeStamp: string;
    blockHeight: string;
  };
  chainId: number;
  isCopy?: boolean;
}


const NodeTxsItem: FC<OwnProps> = ({ item, chainId, isCopy = true }) => {
  const getSquareIcon = () => {
    switch (item.typeOfTx) {
      case 'Send':
        return icons.GreenSquareIcon;
      case 'Unjail':
        return icons.RedSquareIcon;
      case 'Claim Rewards':
        return icons.YellowSquareIcon;
      default:
        return icons.GreenSquareIcon;
    }
  };
  
  const link = `/networks/${chainId}/tx/${item.txHash}`;

  return (
    <tr className="group cursor-pointer hover:bg-bgHover">
      <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getSquareIcon()} alt={`${item.typeOfTx}`} width={30} height={30} />
          </div>
          <div className="flex-grow text-center">{item.typeOfTx}</div>
        </div>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link href={link} className="flex justify-center">
          <div
            className="text-center font-handjet text-lg underline underline-offset-3">{cutHash({ value: item.txHash })}</div>
        </Link>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <div className="flex justify-center">
          <span className="text-center text-base">{item.timeStamp}</span>
          {isCopy && <CopyButton value={item.timeStamp} size="sm" />}
        </div>
      </td>
      <td className="w-1/4 border-b border-black px-2 py-2 hover:text-highlight active:border-bgSt">
        <Link href={link} className="flex justify-center">
          <div className="font-handjet text-lg text-center">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
        </Link>
      </td>
    </tr>
  );
};

export default NodeTxsItem;
