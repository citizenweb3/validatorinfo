import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import Calculator from '@/app/stakingcalculator/calculator';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { Locale } from '@/i18n';
import { getChains } from '@/actions/chains';
import SpreadModal from '@/app/about/modals/spread-modal';

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
      <Story
        src={'calculator'}
        alt="Pixelated, 90s game-style characters inside a calculator helping to select best validator"
      />
      <TabList page="HomePage" tabs={mainTabs} />
      <PageTitle text={t('title')} />
      <div className="m-4 whitespace-pre-line pt-2 text-base">{t('description')}</div>
      <Suspense fallback={<div>Loading...</div>}>
        <Calculator chainList={chainsWithPrices} />
      </Suspense>
      <SpreadModal />
    </div>
  );
}
