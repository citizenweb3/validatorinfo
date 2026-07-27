import { getTranslations } from 'next-intl/server';

import AccountTransfers from '@/app/networks/[name]/address/[accountAddress]/tokens/transfers-table/account-transfers';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string; accountAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Tokens' });

  return {
    title: t('title'),
  };
}

const AccountTokenPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, name, accountAddress },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Tokens' });

  // Cursor-in-URL pagination: ?c=<cursor token>&w=<window>, same model as the transactions tab.
  const cursorToken = typeof q.c === 'string' ? q.c : undefined;
  const windowIndex = q.w ? parseInt(q.w as string, 10) : 0;

  return (
    <div className="mb-14">
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <AccountTransfers
        chainName={name}
        accountAddress={accountAddress}
        locale={locale}
        cursorToken={cursorToken}
        windowIndex={Number.isFinite(windowIndex) ? windowIndex : 0}
      />
    </div>
  );
};

export default AccountTokenPage;
