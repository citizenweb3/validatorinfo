import Image from 'next/image';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';
import { TxStatus } from '@/services/tx-service';

interface CosmosItem {
  typeOfTx: string;
  hash: string;
  timeStamp: string;
  blockHeight: string;
}

interface AztecItem {
  hash: string;
  status: TxStatus;
  blockHeight?: number;
  transactionFee?: string;
  feePayer?: string;
}

interface OwnProps {
  name: string;
  item: CosmosItem | AztecItem;
  isAztec?: boolean;
  coinDecimals?: number;
  timestampSlot?: ReactNode;
}

const getStatusIcon = (status: TxStatus) => {
  switch (status) {
    case 'pending':
      return icons.YellowSquareIcon;
    case 'confirmed':
      return icons.GreenSquareIcon;
    case 'dropped':
      return icons.RedSquareIcon;
  }
};

const NetworkTxsItem: FC<OwnProps> = ({ name, item, isAztec, coinDecimals, timestampSlot }) => {
  if (isAztec) {
    const tx = item as AztecItem;
    const link = `/networks/${name}/tx/${tx.hash}`;
    const isPending = tx.status === 'pending';
    const statusIcon = getStatusIcon(tx.status);

    const formattedFee = !isPending && tx.transactionFee != null && coinDecimals != null
      ? (Number(tx.transactionFee) / 10 ** coinDecimals).toLocaleString('en-US', { maximumSignificantDigits: 3 })
      : tx.transactionFee;

    return (
      <BaseTableRow>
        <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
          <Link href={link} className="flex items-center">
            <div className="flex-shrink-0">
              <Image src={statusIcon} alt={tx.status} width={30} height={30} />
            </div>
            <div className="flex-grow text-center font-handjet text-lg underline underline-offset-3">
              {cutHash({
                value: tx.hash,
                cutLength: 12,
              })}
            </div>
          </Link>
        </BaseTableCell>
        <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
          <div className="text-center font-handjet text-lg flex justify-center">
            {isPending ? '—' : `${formattedFee} AZTEC`}
          </div>
        </BaseTableCell>
        <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
          {isPending ? (
            <div className="text-center font-handjet text-lg">—</div>
          ) : (
            <Link href={`/networks/${name}/blocks/${tx.blockHeight}`} className="flex justify-center">
              <div className="text-center font-handjet text-lg hover:underline">
                {tx.blockHeight?.toLocaleString('ru-RU')}
              </div>
            </Link>
          )}
        </BaseTableCell>
        <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
          <div className="flex justify-center text-center">{timestampSlot}</div>
        </BaseTableCell>
      </BaseTableRow>
    );
  }

  // Cosmos-style items (unchanged)
  const cosmosItem = item as CosmosItem;
  const getSquareIcon = () => {
    switch (cosmosItem.typeOfTx) {
      case 'Send':
        return icons.GreenSquareIcon;
      default:
        return icons.RedSquareIcon;
    }
  };

  const link = `/networks/${name}/tx/${cosmosItem.hash}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/4 py-4 text-base hover:text-highlight">
        <Link href={link} className="flex items-center">
          <div className="flex-shrink-0">
            <Image src={getSquareIcon()} alt={`${cosmosItem.typeOfTx}`} width={30} height={30} />
          </div>
          <div className="flex-grow text-center font-handjet text-lg underline underline-offset-3">
            {cutHash({ value: cosmosItem.hash })}
          </div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-sfpro text-base">{cosmosItem.typeOfTx}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-handjet text-lg">
            {Number(cosmosItem.blockHeight).toLocaleString('ru-RU')}
          </div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/4 px-2 py-2 hover:text-highlight">
        <Link href={link} className="flex justify-center">
          <div className="text-center font-sfpro text-base">{cosmosItem.timeStamp}</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default NetworkTxsItem;
