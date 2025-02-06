import Link from 'next/link';
import { FC } from 'react';

import cutHash from '@/utils/cut-hash';

interface OwnProps {
  item: {
    address: string;
    amount: number;
    happened: string;
    txHash: string;
    blockHeight: string;
  };
}

const DelegatedEventsItem: FC<OwnProps> = ({ item }) => {
  return (
    <tr className="group cursor-pointer text-base hover:bg-bgHover">
      <td className="w-2/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{cutHash(item.address, 20)}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet">{item.amount}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center">{item.happened}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet underline underline-offset-4">{cutHash(item.txHash, 20)}</div>
        </Link>
      </td>
      <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
        <Link href={''} className="flex justify-center">
          <div className="text-center font-handjet">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
        </Link>
      </td>
    </tr>
  );
};

export default DelegatedEventsItem;
