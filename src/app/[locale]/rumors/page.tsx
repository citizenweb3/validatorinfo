import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

import ChatWrapper from '@/app/rumors/chat-wrapper';
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
      <div className="my-2">
        <Image src="/img/stories/rumors.png" alt="logo" width={3010} height={208} className="w-full" priority />
      </div>
      <TabList page="HomePage" tabs={mainTabs} />
      <SubTitle text={t('title')} />
      <ChatWrapper />
    </div>
  );
};

export default RumorsPage;
