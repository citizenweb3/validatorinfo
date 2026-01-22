import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  item: {
    address: string;
    amount: number;
    happened: string;
    txHash: string;
    blockHeight: string;
  };
  chainName: string;
}

const isAztecChain = (chainName: string): boolean => {
  return chainName === 'aztec' || chainName === 'aztec-testnet';
};

const getEtherscanTxLink = (txHash: string): string => {
  return `https://etherscan.io/tx/${txHash}`;
};

const DelegatedEventsItem: FC<OwnProps> = ({ chainName, item }) => {
  const isAztec = isAztecChain(chainName);
  const txLink = isAztec ? getEtherscanTxLink(item.txHash) : `/networks/${chainName}/tx/${item.txHash}`;
  const accountLink = `/networks/${chainName}/address/${item.address}/passport`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-2/6 px-2 py-4 hover:text-highlight">
        <Link href={accountLink} className="flex justify-center">
          <div className="text-center text-base font-sfpro">{cutHash({ value: item.address, cutLength: 14 })}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-4 hover:text-highlight">
        <Link href={txLink} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{item.amount}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-4 hover:text-highlight">
        <Link href={txLink} className="flex justify-center">
          <div className="text-center text-base font-sfpro">{item.happened}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-4 hover:text-highlight">
        {isAztec ? (
          <a
            href={txLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center"
            aria-label="View transaction on Etherscan"
          >
            <div className="text-center font-handjet text-lg underline underline-offset-4">
              {cutHash({ value: item.txHash, cutLength: 14 })}
            </div>
          </a>
        ) : (
          <Link href={txLink} className="flex justify-center">
            <div className="text-center font-handjet text-lg underline underline-offset-4">
              {cutHash({ value: item.txHash })}
            </div>
          </Link>
        )}
      </BaseTableCell>
      <BaseTableCell className="w-1/6 px-2 py-4 hover:text-highlight">
        <Link href={txLink} className="flex justify-center">
          <div className="text-center font-handjet text-lg">{Number(item.blockHeight).toLocaleString('ru-Ru')}</div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default DelegatedEventsItem;
