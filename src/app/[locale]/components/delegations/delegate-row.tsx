'use client';

import Link from 'next/link';
import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import CopyButton from '@/components/common/copy-button';
import type { DelegationItem } from '@/services/delegation-service';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  item: DelegationItem;
  chainName: string;
  unit: 'token' | 'usd';
  price: number;
}

const formatAmount = (amount: number): string =>
  amount.toLocaleString('en-US', {
    maximumFractionDigits: 6,
  });

const formatUsdAmount = (amount: number, price: number): string =>
  `$${(amount * price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DelegateRow: FC<OwnProps> = ({ item, chainName, unit, price }) => {
  const txLink = `/networks/${chainName}/tx/${encodeURIComponent(item.txHash)}`;
  const blockLink = `/networks/${chainName}/blocks/${item.blockHeight}`;
  const accountLink = `/networks/${chainName}/address/${item.address}/passport`;
  const amountLabel = unit === 'usd'
    ? formatUsdAmount(item.amount, price)
    : `${formatAmount(item.amount)} ${item.denom}`;

  return (
    <BaseTableRow>
      <BaseTableCell className="w-1/5 px-2 py-4 hover:text-highlight">
        <div className="flex items-center justify-center">
          <Link href={accountLink} className="flex justify-center">
            <div className="text-center text-base font-sfpro">{cutHash({ value: item.address, cutLength: 14 })}</div>
          </Link>
          <CopyButton value={item.address} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-4 hover:text-highlight">
        <Link href={txLink} className="flex justify-center">
          <div className="text-center font-handjet text-lg">
            {amountLabel}
          </div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-4 hover:text-highlight">
        <Link href={txLink} className="flex justify-center">
          <div className="text-center text-base font-sfpro">{item.happened}</div>
        </Link>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-4 hover:text-highlight">
        <div className="flex items-center justify-center">
          <Link href={txLink} className="flex justify-center">
            <div className="text-center font-handjet text-lg underline underline-offset-4">
              {cutHash({ value: item.txHash })}
            </div>
          </Link>
          <CopyButton value={item.txHash} size="md" />
        </div>
      </BaseTableCell>
      <BaseTableCell className="w-1/5 px-2 py-4 hover:text-highlight">
        <Link href={blockLink} className="flex justify-center">
          <div className="text-center font-handjet text-lg underline underline-offset-2">
            {Number(item.blockHeight).toLocaleString('en-US')}
          </div>
        </Link>
      </BaseTableCell>
    </BaseTableRow>
  );
};

export default DelegateRow;
