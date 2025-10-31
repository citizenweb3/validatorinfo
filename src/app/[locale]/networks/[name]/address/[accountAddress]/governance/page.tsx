import { getTranslations } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import PageTitle from '@/components/common/page-title';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {}

const AccountGovernancePage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Governance' });

  return (
    <div>
      <PageTitle text={t('title')} />
      <NotToday />
    </div>
  );
};

export default AccountGovernancePage;
