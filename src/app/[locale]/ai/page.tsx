import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { NextPageWithLocale } from '@/i18n';
import SubDescription from '@/components/sub-description';

const RumorsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AIPage' });
  return (
    <div>
      <Story src="ai" alt="Pixelated, 90s game-style characters talking with a GPT-style AI caht bot" />
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <NotToday />
    </div>
  );
};

export default RumorsPage;
