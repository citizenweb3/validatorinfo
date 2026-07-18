import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';

import AccountGovernanceContent from './account-governance-content';
import AccountGovernanceSkeleton from './account-governance-skeleton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { name: string; accountAddress: string };
}

const AccountGovernancePage: NextPageWithLocale<PageProps> = async ({ params: { locale, name, accountAddress } }) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Governance' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <Suspense key={accountAddress} fallback={<AccountGovernanceSkeleton />}>
        <AccountGovernanceContent chainName={name} accountAddress={accountAddress} />
      </Suspense>
    </div>
  );
};

export default AccountGovernancePage;
