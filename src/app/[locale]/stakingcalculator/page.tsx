import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { getChains } from '@/actions/chains';
import Calculator from '@/app/stakingcalculator/calculator';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
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
        <CollapsePageHeader>
          <Story
            src={'calculator'}
            alt="Pixelated, 90s game-style characters inside a calculator helping to select best validator"
          />
        </CollapsePageHeader>
        <TabList page="HomePage" tabs={mainTabs} />
      </PageHeaderVisibilityWrapper>
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mb-6'} />
      <Suspense fallback={<div>Loading...</div>}>
        <Calculator chainList={chainsWithPrices} />
      </Suspense>
    </div>
  );
}
