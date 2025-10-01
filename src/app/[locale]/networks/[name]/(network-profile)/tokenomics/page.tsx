import { getTranslations } from 'next-intl/server';

import RevenueCapitalFlowChart from '@/app/networks/[name]/(network-profile)/tokenomics/charts/revenue-capital-flow-chart';
import TokenPriceChart from '@/app/networks/[name]/(network-profile)/tokenomics/charts/token-price-chart';
import DistributionGiniParameters from '@/app/networks/[name]/(network-profile)/tokenomics/distribution-gini-parameters';
import TokenPrice from '@/app/networks/[name]/(network-profile)/tokenomics/token-price';
import PageTitle from '@/components/common/page-title';
import SubTitle from '@/components/common/sub-title';
import SubDescription from '@/components/sub-description';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import TokenomicsService from '@/services/tokenomics-service';

interface PageProps {
  params: NextPageWithLocale & { name: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkTokenomics' });

  return {
    title: t('title'),
  };
}

const NetworkTokenomicsPage: NextPageWithLocale<PageProps> = async ({ params: { locale, name } }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkTokenomics' });
  const chain = await chainService.getByName(name);
  const tokenPrice = chain ? await chainService.getTokenPriceByChainId(chain?.id) : null;
  const tokenomics = chain ? await TokenomicsService.getTokenomicsByChainId(chain?.id) : null;

  return (
    <div>
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <TokenPrice
        denom={chain?.params?.denom ?? null}
        price={tokenPrice ? tokenPrice.value : 12.43}
        tokenomics={tokenomics}
      />
      <DistributionGiniParameters chain={chain} />
      <SubTitle text={t('Token Price')} />
      <TokenPriceChart />
      <SubTitle text={t('Revenue vs Capital Flow')} />
      <RevenueCapitalFlowChart />
    </div>
  );
};

export default NetworkTokenomicsPage;
