import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { getChains } from '@/actions/chains';
import Calculator from '@/app/stakingcalculator/calculator';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'CalculatorPage' });

  return {
    title: t('Metadata.title'),
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StakingCalculatorPage({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) {
  const t = await getTranslations('CalculatorPage');
  const chainsWithPrices = await getChains();

  return (
    <div className="flex flex-col">
      <PageHeaderVisibilityWrapper>
        <TabList page="HomePage" tabs={mainTabs} />
      </PageHeaderVisibilityWrapper>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <SubTitle text={t('UnderConstruction')} className={'my-4'} />
      <div className="blur-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <Calculator chainList={chainsWithPrices} />
        </Suspense>
      </div>
    </div>
  );
}
