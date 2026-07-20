import { FC, Suspense } from 'react';

import NodeTxsList from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/node-txs-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TxRowsSkeleton from '@/components/txs/tx-rows-skeleton';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  chainName: string;
  accountAddress: string | null;
  operatorAddress: string;
  cursorToken?: string;
  windowIndex: number;
}

const NodeTxs: FC<OwnProps> = ({ chainName, page, accountAddress, operatorAddress, cursorToken, windowIndex }) => {
  // key on the address set so the streaming boundary resets only when the addresses change
  const addressKey = `${accountAddress ?? ''}-${operatorAddress}`;
  return (
    <div className="pt-8">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Type of Tx" />
            <TableHeaderItem page={page} name="Tx Hash" />
            <TableHeaderItem page={page} name="Timestamp" />
            <TableHeaderItem page={page} name="Block Height" />
          </tr>
        </thead>
        <Suspense key={addressKey} fallback={<TxRowsSkeleton rows={20} />}>
          <NodeTxsList
            chainName={chainName}
            accountAddress={accountAddress}
            operatorAddress={operatorAddress}
            cursorToken={cursorToken}
            windowIndex={windowIndex}
          />
        </Suspense>
      </BaseTable>
    </div>
  );
};

export default NodeTxs;
