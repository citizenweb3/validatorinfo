import { getTranslations } from 'next-intl/server';

import ChatWrapper from '@/app/rumors/chat-wrapper';
import Story from '@/components/Story';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const RumorsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'RumorsPage' });
  return (
    <div className="flex flex-grow flex-col">
      <Story
        src="rumors"
        alt="Pixelated, 90s game-style characters spreading rumors outside entrance to the p2p chat"
      />
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <ChatWrapper />
    </div>
  );
};

export default RumorsPage;
