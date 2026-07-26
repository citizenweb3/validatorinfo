import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { type ReactNode, Suspense } from 'react';

import { getChains } from '@/actions/chains';
import Calculator from '@/app/stakingcalculator/calculator';
import MiningCalculator from '@/app/stakingcalculator/mining-calculator';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import CalculatorModeTabs from '@/components/calculator-mode-tabs';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { toolsTabsHorizontal } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';
import miningProfitabilityService from '@/services/mining-profitability-service';

type CalculatorMode = 'mining' | 'staking';

interface CalculatorPageProps {
  params: { locale: Locale };
  searchParams: { mode?: string; network?: string };
}

const getCalculatorMode = (mode?: string): CalculatorMode => (mode === 'mining' ? 'mining' : 'staking');

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'CalculatorPage' });

  return {
    title: t('Metadata.title'),
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const StakingCalculatorPage = async ({ params: { locale }, searchParams }: Readonly<CalculatorPageProps>) => {
  unstable_setRequestLocale(locale);
  const activeMode = getCalculatorMode(searchParams.mode);

  const commonTranslationsPromise = getTranslations({ locale, namespace: 'CalculatorPage' });
  const miningTranslationsPromise =
    activeMode === 'mining' ? getTranslations({ locale, namespace: 'MiningCalculatorPage' }) : Promise.resolve(null);
  const moneroChainPromise = activeMode === 'mining' ? chainService.getByName('monero') : Promise.resolve(null);
  const stakingChainsPromise = activeMode === 'staking' ? getChains() : Promise.resolve([]);

  const [t, tMining, moneroChain, chainsWithPrices] = await Promise.all([
    commonTranslationsPromise,
    miningTranslationsPromise,
    moneroChainPromise,
    stakingChainsPromise,
  ]);

  let calculatorContent: ReactNode;
  if (activeMode === 'mining' && tMining) {
    const economics = await miningProfitabilityService.getMoneroMiningEconomics(moneroChain);
    calculatorContent = (
      <>
        <SubTitle text={tMining('title')} className="my-4" />
        {economics ? (
          <MiningCalculator economics={economics} locale={locale} />
        ) : (
          <p className="mx-auto my-12 border-r border-t border-bgSt bg-table_row p-6 font-sfpro text-base">
            {tMining('dataUnavailable')}
          </p>
        )}
      </>
    );
  } else {
    calculatorContent = (
      <>
        <SubTitle text={t('UnderConstruction')} className="my-4" />
        <div className="blur-sm">
          <Suspense fallback={<div>Loading...</div>}>
            <Calculator chainList={chainsWithPrices} />
          </Suspense>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col">
      <PageHeaderVisibilityWrapper>
        <TabList page="HomePage" tabs={toolsTabsHorizontal} />
      </PageHeaderVisibilityWrapper>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <CalculatorModeTabs
        activeMode={activeMode}
        ariaLabel={t('modeNavigation')}
        miningLabel={t('miningMode')}
        stakingLabel={t('stakingMode')}
      />
      {calculatorContent}
    </div>
  );
};

export default StakingCalculatorPage;
