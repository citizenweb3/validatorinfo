import { getTranslations } from 'next-intl/server';

import AccountTransactions from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/account-transactions';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import { getChainLcdContext } from '@/services/chain-service';
import type { TxAmountContext } from '@/services/tx-service';
import { canonicalTxFilterKey, parseTxFiltersFromSearchParams } from '@/utils/tx-filters';
import { isTxByAddressChainSupported } from '@/utils/tx-supported-chains';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string; accountAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Transactions' });

  return {
    title: t('title'),
  };
}

const AccountTransactionsPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, name, accountAddress },
  searchParams: q,
}) => {
  const [t, chainContext] = await Promise.all([
    getTranslations({ locale, namespace: 'AccountPage.Transactions' }),
    isTxByAddressChainSupported(name) ? getChainLcdContext(name) : Promise.resolve(null),
  ]);
  const amountContext: TxAmountContext | null = chainContext
    ? {
        coinDecimals: chainContext.coinDecimals,
        denom: chainContext.denom,
        minimalDenom: chainContext.minimalDenom,
      }
    : null;

  // Cursor-in-URL pagination: ?c=<cursor token>&w=<window>. Cold load lands exactly on that window.
  const cursorToken = typeof q.c === 'string' ? q.c : undefined;
  const windowIndex = q.w ? parseInt(q.w as string, 10) : 0;
  const filters = parseTxFiltersFromSearchParams(q, name);
  const filterKey = canonicalTxFilterKey(filters);

  return (
    <div className="mb-14">
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <AccountTransactions
        chainName={name}
        page={'TxSummaryPage'}
        accountAddress={accountAddress}
        cursorToken={cursorToken}
        windowIndex={Number.isFinite(windowIndex) ? windowIndex : 0}
        filters={filters}
        filterKey={filterKey}
        amountContext={amountContext}
      />
    </div>
  );
};

export default AccountTransactionsPage;
