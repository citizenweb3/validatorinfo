import { getTranslations } from 'next-intl/server';

import ComparisonTable from '@/app/comparevalidators/comparison-table';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ValidatorComparisonPage: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ComparisonPage' });

  return (
    <div className="flex flex-grow flex-col">
      <Story
        src="compare"
        alt="Pixelated, 90s game-style characters playing amongst numbers helping comparing validators"
      />
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <div className="m-4 whitespace-pre-line pt-2 text-base">{t('description')}</div>
      <SubDescription text={t('descriptionExtended')} contentClassName={'m-4'} plusClassName={'my-4'} />
      <ComparisonTable />
    </div>
  );
};

export default ValidatorComparisonPage;
