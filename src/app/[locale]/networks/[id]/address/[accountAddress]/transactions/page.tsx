import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import { getTranslations } from 'next-intl/server';
import SubDescription from '@/components/sub-description';
import PageTitle from '@/components/common/page-title';
import AccountTransactions
  from '@/app/networks/[id]/address/[accountAddress]/transactions/transactions-table/account-transactions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string; accountAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Transactions' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const AccountTransactionsPage: NextPageWithLocale<PageProps> = async (
  {
    params: { locale, id, accountAddress },
    searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Transactions' });
  const chainId = parseInt(id);

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div className="mb-14">
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <AccountTransactions chainId={chainId}
                           page={'TxSummaryPage'}
                           perPage={perPage}
                           currentPage={currentPage}
                           sort={{ sortBy, order }} />
    </div>
  );
};

export default AccountTransactionsPage;
