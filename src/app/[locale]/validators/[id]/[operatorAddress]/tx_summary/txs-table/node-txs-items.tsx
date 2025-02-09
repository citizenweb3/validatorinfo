import Image from 'next/image';
import Link from 'next/link';
import {FC} from 'react';

import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
    item: {
        typeOfTx: string;
        txHash: string;
        timeStamp: string;
        blockHeight: string;
    };
}

const NodeTxsItem: FC<OwnProps> = ({item}) => {
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

    return (
        <tr className="group cursor-pointer hover:bg-bgHover">
            <td className="w-1/4 border-b border-black py-4 text-base hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex items-center">
                    <div className="flex-shrink-0">
                        <Image src={getSquareIcon()} alt={`${item.typeOfTx}`} width={30} height={30}/>
                    </div>
                    <div className="flex-grow text-center">{item.typeOfTx}</div>
                </Link>
            </td>
            <td className="w-1/4 border-b border-black px-2 py-2 text-base hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div
                        className="text-center font-handjet underline underline-offset-4">{cutHash({value: item.txHash})}</div>
                </Link>
            </td>
            <td className="w-1/4 border-b border-black px-2 py-2 text-sm hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div className="text-center">{item.timeStamp}</div>
                </Link>
            </td>
            <td className="w-1/4 border-b border-black px-2 py-2 text-base hover:text-highlight active:border-bgSt">
                <Link href={''} className="flex justify-center">
                    <div className="font-handjet text-center">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
                </Link>
            </td>
        </tr>
    );
};

export default NodeTxsItem;
