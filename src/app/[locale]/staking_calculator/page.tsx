import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import Calculator from '@/app/staking_calculator/calculator';
import Story from '@/components/Story';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import validatorService from '@/services/validator-service';

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
  const validatorsList = await validatorService.getList();

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
        <Calculator validatorsList={validatorsList} />
      </Suspense>
    </div>
  );
}
