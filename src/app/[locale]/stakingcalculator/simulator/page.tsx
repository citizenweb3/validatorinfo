import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { getSimulatorChains } from '@/actions/simulator';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { calculatorTabs, mainTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';
import Simulator from './simulator';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'StakingSimulator' });

  return {
    title: t('Metadata.title'),
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const StakingSimulatorPage = async ({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) => {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('StakingSimulator');
  const chains = await getSimulatorChains();

  return (
    <div className="flex flex-col">
      <PageHeaderVisibilityWrapper>
        <CollapsePageHeader>
          <Story
            src={'calculator'}
            alt="Pixelated, 90s game-style characters inside a calculator helping to simulate staking rewards"
          />
        </CollapsePageHeader>
        <TabList page="HomePage" tabs={mainTabs} />
      </PageHeaderVisibilityWrapper>
      <TabList page="HomePage" tabs={calculatorTabs} />
      <PageTitle text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mb-6'} />
      <Suspense fallback={<div className="p-4 font-handjet text-lg">{t('Loading')}</div>}>
        <Simulator chains={chains} />
      </Suspense>
    </div>
  );
};

export default StakingSimulatorPage;
