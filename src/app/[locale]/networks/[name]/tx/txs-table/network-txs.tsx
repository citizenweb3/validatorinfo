import { FC } from 'react';

import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import { PagesProps } from '@/types';
import NetworkTxsList from '@/app/networks/[name]/tx/txs-table/network-txs-list';
import { isAztecChainName } from '@/utils/aztec';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  name: string;
  chainName: string;
  coinDecimals?: number;
  showPending?: boolean;
}

const NetworkTxs: FC<OwnProps> = async ({ name, chainName, page, perPage, currentPage, coinDecimals, showPending }) => {
  const isAztec = isAztecChainName(chainName);
  const isLogos = chainName.toLowerCase() === 'logos-testnet';
  const isCosmoshub = chainName.toLowerCase() === 'cosmoshub';
  const isAtomone = chainName.toLowerCase() === 'atomone';

  return (
    <div className="mt-12">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            <TableHeaderItem page={page} name="Tx Hash" />
            {isAztec && <TableHeaderItem page={page} name="Fee" />}
            {isLogos && <TableHeaderItem page={page} name="Op Type" />}
            {(isCosmoshub || isAtomone) && <TableHeaderItem page={page} name="Type of Tx" />}
            {!isAztec && !isLogos && !isCosmoshub && !isAtomone && <TableHeaderItem page={page} name="Type of Tx" />}
            <TableHeaderItem page={page} name="Block Height" />
            <TableHeaderItem page={page} name="Timestamp" />
          </tr>
        </thead>
        <NetworkTxsList name={name} chainName={chainName} perPage={perPage} currentPage={currentPage} showPending={showPending} coinDecimals={coinDecimals} />
      </BaseTable>
    </div>
  );
};

export default NetworkTxs;
