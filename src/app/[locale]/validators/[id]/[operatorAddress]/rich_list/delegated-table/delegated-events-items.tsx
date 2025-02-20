import Link from 'next/link';
import {FC} from 'react';

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

const DelegatedEventsItem: FC<OwnProps> = ({item}) => {
    return (
        <tr className="group cursor-pointer hover:bg-bgHover">
            <td className="w-2/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div className="text-center text-base font-sfpro">{cutHash({value: item.address})}</div>
                </Link>
            </td>
            <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div className="text-center font-handjet text-lg">{item.amount}</div>
                </Link>
            </td>
            <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div className="text-center text-base font-sfpro">{item.happened}</div>
                </Link>
            </td>
            <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div
                        className="text-center font-handjet text-lg underline underline-offset-4">{cutHash({value: item.txHash})}</div>
                </Link>
            </td>
            <td className="w-1/6 border-b border-black px-2 py-4 hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div className="text-center font-handjet text-lg">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
                </Link>
            </td>
        </tr>
    );
};

export default DelegatedEventsItem;
