import { Locale, NextPageWithLocale } from '@/i18n';
import { getTranslations } from 'next-intl/server';
import SubDescription from '@/components/sub-description';
import PageTitle from '@/components/common/page-title';
import AccountTransactions
  from '@/app/networks/[name]/address/[accountAddress]/transactions/transactions-table/account-transactions';

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

const AccountTransactionsPage: NextPageWithLocale<PageProps> = async (
  {
    params: { locale, name, accountAddress },
    searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Transactions' });

  // Cursor-in-URL pagination: ?c=<cursor token>&w=<window>. Cold load lands exactly on that window.
  const cursorToken = typeof q.c === 'string' ? q.c : undefined;
  const windowIndex = q.w ? parseInt(q.w as string, 10) : 0;

  return (
    <div className="mb-14">
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <AccountTransactions chainName={name}
                           page={'TxSummaryPage'}
                           accountAddress={accountAddress}
                           cursorToken={cursorToken}
                           windowIndex={Number.isFinite(windowIndex) ? windowIndex : 0} />
    </div>
  );
};

export default AccountTransactionsPage;
