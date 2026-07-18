import { FC } from 'react';

import NodeTxsItem from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/node-txs-items';
import { nodeTxsExample } from '@/app/validators/[id]/[operatorAddress]/tx_summary/txs-table/nodeTxsExample';
import TablePagination from '@/components/common/table/table-pagination';
import { decodeCursorToken } from '@/components/txs/tx-cursor-token';
import TxListClient from '@/components/txs/tx-list-client';
import TxService from '@/services/tx-service';
import { EMPTY_TX_FILTERS } from '@/utils/tx-filters';
import { isTxByAddressChainSupported } from '@/utils/tx-supported-chains';

const PER_PAGE = 20;

interface OwnProps {
  chainName: string;
  accountAddress: string | null;
  operatorAddress: string;
  cursorToken?: string;
  windowIndex: number;
}

const NodeTxsList: FC<OwnProps> = async ({ chainName, accountAddress, operatorAddress, cursorToken, windowIndex }) => {
  // CosmosHub and AtomOne carry REAL indexer data via cursor pagination. Other networks keep the
  // static mock placeholder (no per-address tx indexer yet) — same fallback the global /tx table uses.
  if (isTxByAddressChainSupported(chainName)) {
    // Query the node's account AND operator address (server-side `signers &&` union). A null
    // accountAddress yields an operator-only feed (account-signed ops omitted) — known gap.
    const addresses = [accountAddress, operatorAddress].filter((address): address is string => !!address);

    if (addresses.length > 0) {
      const cursor = decodeCursorToken(cursorToken);
      const initial = await TxService.getTxsByAddressBatch(chainName, addresses, EMPTY_TX_FILTERS, cursor);
      const windows = Math.max(1, Math.ceil(initial.rows.length / PER_PAGE));
      const clampedWindow = Math.min(Math.max(0, windowIndex), windows - 1);

      return (
        <TxListClient
          addresses={addresses}
          chainName={chainName}
          initialCursor={cursor ?? null}
          initialWindow={clampedWindow}
          initial={initial}
          filters={EMPTY_TX_FILTERS}
          amountContext={null}
        />
      );
    }
  }

  return (
    <tbody>
      {nodeTxsExample.map((item, index) => (
        <NodeTxsItem key={`${item.txHash}-${index}`} item={item} chainName={chainName} />
      ))}
      <tr>
        <td colSpan={4} className="pt-4">
          <TablePagination pageLength={1} />
        </td>
      </tr>
    </tbody>
  );
};

export default NodeTxsList;
