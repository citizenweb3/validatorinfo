import { getTranslations } from 'next-intl/server';

import ChatWrapper from '@/app/p2pchat/chat-wrapper';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
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
      <PageHeaderVisibilityWrapper>
        <TabList page="HomePage" tabs={mainTabs} />
      </PageHeaderVisibilityWrapper>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <ChatWrapper />
    </div>
  );
};

export default RumorsPage;
