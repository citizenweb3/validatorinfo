import { getTranslations } from 'next-intl/server';

import Description from '@/components/common/description';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import AiChatInline from '@/components/home/ai-chat-inline';
import InfrastructureBanner from '@/components/home/infrastructure-banner';
import LinksGrid from '@/components/home/links-grid';
import StatsTable from '@/components/home/stats-table';
import TopPerformers from '@/components/home/top-performers';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const Home: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return (
    <div className="flex min-w-0 flex-col">
      <TabList page="HomePage" tabs={mainTabs} />

      <div className="flex w-full min-w-0 flex-col">
        <PageTitle text={t('heroTitle')} />
        <Description text={t('heroSubtitle')} className="mt-3 px-4" />

        <div className="mt-12 md:mt-8">
          <StatsTable />
        </div>
        <div className="mt-28 md:mt-20">
          <LinksGrid />
        </div>
        <div className="mt-28 md:mt-20">
          <InfrastructureBanner />
        </div>

        <div className="mt-28 grid min-w-0 gap-16 md:mt-20 md:gap-5 2xl:grid-cols-2 2xl:items-start 2xl:gap-x-10">
          <AiChatInline />
          <TopPerformers />
        </div>
      </div>
    </div>
  );
};

export default Home;
