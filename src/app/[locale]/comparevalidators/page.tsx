import { getTranslations } from 'next-intl/server';

import ComparisonTable from '@/app/comparevalidators/comparison-table';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';
import nodeService from '@/services/node-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { locale: string };
  searchParams: { validator?: string };
}

const ValidatorComparisonPage: NextPageWithLocale<PageProps> = async ({
    params: { locale },
    searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'ComparisonPage' });

  let validator = null;

  const nodeId = q.validator;
  if (nodeId) {
    validator = await nodeService.getValidatorByNodeId(parseInt(nodeId));
  }

  return (
    <div className="flex flex-grow flex-col">
      <Story
        src="compare"
        alt="Pixelated, 90s game-style characters playing amongst numbers helping comparing validators"
      />
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mb-4 mt-2'} />
      <ComparisonTable validator={validator} />
    </div>
  );
};

export default ValidatorComparisonPage;
