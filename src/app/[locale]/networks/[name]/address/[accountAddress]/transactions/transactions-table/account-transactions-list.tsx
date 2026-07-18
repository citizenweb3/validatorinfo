import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import TxService from '@/services/tx-service';
import TxListClient from '@/components/txs/tx-list-client';
import { decodeCursorToken } from '@/components/txs/tx-cursor-token';
import { accountTxsExample } from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/accountTxsExample';
import AccountTransactionsItem from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/account-transactions-item';
import { canonicalTxFilterKey, type TxFilters } from '@/utils/tx-filters';
import { isTxByAddressChainSupported } from '@/utils/tx-supported-chains';

const PER_PAGE = 20;

interface OwnProps {
  chainName: string;
  accountAddress: string;
  cursorToken?: string;
  windowIndex: number;
  filters: TxFilters;
}

const AccountTransactionsList: FC<OwnProps> = async ({
  chainName,
  accountAddress,
  cursorToken,
  windowIndex,
  filters,
}) => {
  // CosmosHub and AtomOne carry REAL indexer data via cursor pagination. Other networks keep the
  // static mock placeholder (no per-address tx indexer yet) — same fallback the global /tx table uses.
  if (isTxByAddressChainSupported(chainName) && accountAddress) {
    const cursor = decodeCursorToken(cursorToken);
    const initial = await TxService.getTxsByAddressBatch(chainName, [accountAddress], filters, cursor);
    const windows = Math.max(1, Math.ceil(initial.rows.length / PER_PAGE));
    const clampedWindow = Math.min(Math.max(0, windowIndex), windows - 1);

    return (
      <TxListClient
        key={canonicalTxFilterKey(filters)}
        addresses={[accountAddress]}
        chainName={chainName}
        initialCursor={cursor ?? null}
        initialWindow={clampedWindow}
        initial={initial}
        filters={filters}
      />
    );
  }

  return (
    <tbody>
      {accountTxsExample.map((item, index) => (
        <AccountTransactionsItem key={`${item.txHash}-${index}`} item={item} chainName={chainName} />
      ))}
      <tr>
        <td colSpan={4} className="pt-4">
          <TablePagination pageLength={1} />
        </td>
      </tr>
    </tbody>
  );
};

export default AccountTransactionsList;
