import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import MiningCalculator from '@/app/miningcalculator/mining-calculator';
import CollapsiblePageHeader from '@/app/validators/collapsible-page-header';
import CalculatorModeTabs from '@/components/calculator-mode-tabs';
import PageHeaderVisibilityWrapper from '@/components/common/page-header-visibility-wrapper';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { toolsTabsHorizontal } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';
import miningProfitabilityService from '@/services/mining-profitability-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'MiningCalculatorPage' });
  return { title: t('metadataTitle') };
}

const MiningCalculatorPage = async ({ params: { locale } }: Readonly<{ params: { locale: Locale } }>) => {
  unstable_setRequestLocale(locale);
  const [t, tModes, chain] = await Promise.all([
    getTranslations({ locale, namespace: 'MiningCalculatorPage' }),
    getTranslations({ locale, namespace: 'CalculatorPage' }),
    chainService.getByName('monero'),
  ]);
  const economics = await miningProfitabilityService.getMoneroMiningEconomics(chain);

  return (
    <div className="flex flex-col">
      <PageHeaderVisibilityWrapper>
        <TabList page="HomePage" tabs={toolsTabsHorizontal} />
      </PageHeaderVisibilityWrapper>
      <CollapsiblePageHeader description={t('description')}>
        <PageTitle text={t('title')} />
      </CollapsiblePageHeader>
      <CalculatorModeTabs
        activeMode="mining"
        ariaLabel={tModes('modeNavigation')}
        miningLabel={tModes('miningMode')}
        stakingLabel={tModes('stakingMode')}
      />
      {economics ? (
        <MiningCalculator economics={economics} locale={locale} />
      ) : (
        <p className="mx-auto my-12 border-r border-t border-bgSt bg-table_row p-6 font-sfpro text-base">
          {t('dataUnavailable')}
        </p>
      )}
    </div>
  );
};

export default MiningCalculatorPage;
