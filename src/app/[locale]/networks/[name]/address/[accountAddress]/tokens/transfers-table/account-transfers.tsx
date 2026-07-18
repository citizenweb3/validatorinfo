import { getTranslations } from 'next-intl/server';
import { FC, Suspense } from 'react';

import AccountTransfersList from '@/app/networks/[name]/address/[accountAddress]/tokens/transfers-table/account-transfers-list';
import BaseTable from '@/components/common/table/base-table';
import TableHeaderItem from '@/components/common/table/table-header-item';
import TxRowsSkeleton from '@/components/txs/tx-rows-skeleton';
import { Locale } from '@/i18n';

interface OwnProps {
  chainName: string;
  accountAddress: string;
  locale: Locale;
  cursorToken?: string;
  windowIndex: number;
}

const AccountTransfers: FC<OwnProps> = async ({ chainName, accountAddress, locale, cursorToken, windowIndex }) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Tokens' });
  const headers = [
    t('directionColumn'),
    t('counterpartyColumn'),
    t('amountColumn'),
    t('txColumn'),
    t('timeColumn'),
  ];

  return (
    <div className="pt-8">
      <BaseTable>
        <thead>
          <tr className="bg-table_header">
            {headers.map((header) => (
              <TableHeaderItem key={header} page="TxSummaryPage">
                <div className="flex items-center justify-center py-3">
                  <div className="text-nowrap text-6xl font-normal sm:text-4xl md:text-sm">{header}</div>
                </div>
              </TableHeaderItem>
            ))}
          </tr>
        </thead>
        <Suspense key={accountAddress} fallback={<TxRowsSkeleton rows={20} columns={5} />}>
          <AccountTransfersList
            chainName={chainName}
            accountAddress={accountAddress}
            cursorToken={cursorToken}
            windowIndex={windowIndex}
          />
        </Suspense>
      </BaseTable>
    </div>
  );
};

export default AccountTransfers;
