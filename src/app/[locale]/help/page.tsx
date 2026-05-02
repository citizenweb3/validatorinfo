import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import ConsolePanel from '@/app/main-validators/validator-list/console-panel';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HelpPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'HelpPage' });

  return (
    <div className="flex flex-col">
      <PageHeaderVisibilityWrapper>
        <TabList page="HomePage" tabs={mainTabs} />
      </PageHeaderVisibilityWrapper>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName="m-4" plusClassName="mt-2" />
      <div className="mx-auto mt-4 w-full max-w-4xl">
        <ConsolePanel chainName="cosmoshub" />
      </div>
    </div>
  );
};

export default HelpPage;
