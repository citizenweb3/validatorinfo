import { FC } from 'react';

import { accountTransfersExample } from '@/app/networks/[name]/address/[accountAddress]/tokens/transfers-table/account-transfers-example';
import TablePagination from '@/components/common/table/table-pagination';
import { decodeTransferCursorToken } from '@/components/transfers/transfer-cursor-token';
import TransferRow from '@/components/transfers/transfer-row';
import TransfersListClient from '@/components/transfers/transfers-list-client';
import TransferFeedService, { isTransferFeedChainSupported } from '@/services/transfer-feed-service';

const PER_PAGE = 20;

interface OwnProps {
  chainName: string;
  accountAddress: string;
  cursorToken?: string;
  windowIndex: number;
}

const AccountTransfersList: FC<OwnProps> = async ({ chainName, accountAddress, cursorToken, windowIndex }) => {
  if (isTransferFeedChainSupported(chainName) && accountAddress) {
    const cursor = cursorToken ? decodeTransferCursorToken(cursorToken) : null;
    const initial = await TransferFeedService.getTransfersByAddressBatch(chainName, accountAddress, cursor ?? undefined);
    const windows = Math.max(1, Math.ceil(initial.rows.length / PER_PAGE));
    const clampedWindow = Math.min(Math.max(0, windowIndex), windows - 1);

    return (
      <TransfersListClient
        accountAddress={accountAddress}
        chainName={chainName}
        initialCursor={cursor ?? null}
        initialWindow={clampedWindow}
        initial={initial}
      />
    );
  }

  return (
    <tbody>
      {accountTransfersExample.map((item) => (
        <TransferRow
          key={`${item.txHash}:${item.msgIndex}:${item.denom}`}
          item={item}
          chainName="cosmoshub"
          accountAddress={accountTransfersExample[0].fromAddr}
        />
      ))}
      <tr>
        <td colSpan={5} className="pt-4">
          <TablePagination pageLength={1} />
        </td>
      </tr>
    </tbody>
  );
};

export default AccountTransfersList;
