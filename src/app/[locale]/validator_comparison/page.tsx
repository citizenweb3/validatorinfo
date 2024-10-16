import { unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';

const ValidatorComparisonPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  return (
    <div>
      <TabList page="HomePage" tabs={mainTabs} />
      <NotToday />
    </div>
  );
};

export default ValidatorComparisonPage;
