import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';
import NetworkTxsList from '@/app/networks/[name]/tx/txs-table/network-txs-list';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  name: string;
  chainName: string;
  coinDecimals?: number;
}

const NetworkTxs: FC<OwnProps> = async ({ name, chainName, page, perPage, currentPage, coinDecimals }) => {
  const isAztec = isAztecChainName(chainName);

  return (
    <div className="mt-12">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Tx Hash" />
            {isAztec ? (
              <TableHeaderItem page={page} name="Fee" />
            ) : (
              <TableHeaderItem page={page} name="Type of Tx" />
            )}
            <TableHeaderItem page={page} name="Block Height" />
            <TableHeaderItem page={page} name="Timestamp" />
          </tr>
        </thead>
        <NetworkTxsList name={name} chainName={chainName} perPage={perPage} currentPage={currentPage} coinDecimals={coinDecimals} />
      </BaseTable>
    </div>
  );
};

export default NetworkTxs;
