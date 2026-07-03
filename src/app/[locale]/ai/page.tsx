import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import AiChatPage from '@/components/ai-chat/ai-chat-page';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { homeTabsHorizontal } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AIPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'AIPage' });

  return (
    <div className="flex flex-grow flex-col gap-4">
      <TabList page="HomePage" tabs={homeTabsHorizontal} />
      <PageTitle text={t('title')} />
      <AiChatPage />
    </div>
  );
};

export default AIPage;
