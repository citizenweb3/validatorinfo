import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import UnderDevelopment from '@/components/common/under-development';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import SubDescription from '@/components/sub-description';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RumorsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AIPage' });
  const underDevelopment = await getTranslations({ locale, namespace: 'UnderDevelopment' });
  return (
    <div className="flex flex-col gap-4">
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <UnderDevelopment
        title={underDevelopment('title')}
        description={underDevelopment('description')}
      />
    </div>
  );
};

export default RumorsPage;
