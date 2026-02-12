import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import TablePagination from '@/components/common/table/table-pagination';
import NetworkTxsItem from '@/app/networks/[name]/tx/txs-table/network-txs-items';
import { networkTxsExample } from '@/app/networks/[name]/tx/txs-table/networkTxsExample';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import TxService, { TxItem } from '@/services/tx-service';
import { formatTimestamp } from '@/utils/format-timestamp';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  name: string;
  chainName: string;
  coinDecimals?: number;
}

const NetworkTxsList: FC<OwnProps> = async ({ name, chainName, perPage, currentPage = 1, coinDecimals }) => {
  const t = await getTranslations('TotalTxsPage');

  if (isAztecChainName(chainName)) {
    const { txs, totalPages, error } = await TxService.getTxsByChainName(chainName, currentPage, perPage);

    if (txs.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={4} className="py-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="font-sfpro text-lg text-gray-500">
                  {error ? t('txListLoadError') : t('noTransactionsYet')}
                </div>
                {!error && (
                  <div className="font-sfpro text-sm text-gray-400">{t('transactionsWillAppear')}</div>
                )}
              </div>
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {txs.map((item: TxItem) => (
          <NetworkTxsItem
            key={item.hash}
            name={name}
            item={item}
            isAztec
            coinDecimals={coinDecimals}
            timestampSlot={
              <span className="font-sfpro text-base">
                {item.timestamp ? formatTimestamp(new Date(item.timestamp)) : '-'}
              </span>
            }
          />
        ))}
        <tr>
          <td colSpan={4} className="pt-4">
            <TablePagination pageLength={totalPages} />
          </td>
        </tr>
      </tbody>
    );
  }

  // Non-Aztec chains: keep existing mock data
  const pages = 1;

  return (
    <tbody>
      {networkTxsExample.map((item) => (
        <NetworkTxsItem key={item.hash} name={name} item={item} />
      ))}
      <tr>
        <td colSpan={4} className="pt-4">
          <TablePagination pageLength={pages} />
        </td>
      </tr>
    </tbody>
  );
};

export default NetworkTxsList;
