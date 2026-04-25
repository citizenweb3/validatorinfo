import { getTranslations } from 'next-intl/server';

import ComparisonTable from '@/app/comparevalidators/comparison-table';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import nodeService from '@/services/node-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { locale: string };
  searchParams: { validator?: string };
}

const ValidatorComparisonPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'ComparisonPage' });

  let validator = null;

  const nodeId = q.validator;
  if (nodeId) {
    validator = await nodeService.getValidatorByNodeId(parseInt(nodeId));
  }

  return (
    <div className="flex flex-grow flex-col">
      <PageHeaderVisibilityWrapper>
        <TabList page="HomePage" tabs={mainTabs} />
      </PageHeaderVisibilityWrapper>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <SubTitle text={t('UnderConstruction')} className={'my-4'} />
      <div className="blur-sm">
        <ComparisonTable validator={validator} />
      </div>
    </div>
  );
};

export default ValidatorComparisonPage;
