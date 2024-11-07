import { getTranslations } from 'next-intl/server';

import ChatWrapper from '@/app/rumors/chat-wrapper';
import Story from '@/components/Story';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RumorsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'RumorsPage' });
  return (
    <div className="flex flex-grow flex-col">
      <Story src="rumors" />
      <TabList page="HomePage" tabs={mainTabs} />
      <SubTitle text={t('title')} />
      <ChatWrapper />
    </div>
  );
};

export default RumorsPage;
