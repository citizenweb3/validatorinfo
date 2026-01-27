import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';
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
  chainName: string;
  isCopy?: boolean;
}


const NodeTxsItem: FC<OwnProps> = ({ item, chainName, isCopy = true }) => {
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
  
  const link = `/networks/${chainName}/tx/${item.txHash}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getSquareIcon()} alt={`${item.typeOfTx}`} width={30} height={30} />
          </div>
          <div className="flex-grow text-center">{item.typeOfTx}</div>
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div
            className="text-center font-handjet text-lg underline underline-offset-3">{cutHash({ value: item.txHash })}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <div className="flex justify-center">
          <span className="text-center text-base">{item.timeStamp}</span>
          {isCopy && <CopyButton value={item.timeStamp} size="sm" />}
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="font-handjet text-lg text-center">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NodeTxsItem;
