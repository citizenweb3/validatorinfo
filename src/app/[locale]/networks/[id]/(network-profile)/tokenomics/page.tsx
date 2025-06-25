import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import TokenPrice from '@/app/networks/[id]/(network-profile)/tokenomics/token-price';
import DistributionGiniParameters from '@/app/networks/[id]/(network-profile)/tokenomics/distribution-gini-parameters';
import SubTitle from '@/components/common/sub-title';
import TokenPriceChart from '@/app/networks/[id]/(network-profile)/tokenomics/charts/token-price-chart';
import RevenueCapitalFlowChart
  from '@/app/networks/[id]/(network-profile)/tokenomics/charts/revenue-capital-flow-chart';
import SubDescription from '@/components/sub-description';
import TokenomicsService from '@/services/tokenomics-service';

interface PageProps {
  params: NextPageWithLocale & { id: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NetworkTokenomics' });

  return {
    title: t('title'),
  };
}


const NetworkTokenomicsPage: NextPageWithLocale<PageProps> = async ({
    params: { locale, id },
  }) => {
  const t = await getTranslations({ locale, namespace: 'NetworkTokenomics' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);
  const tokenPrice = await chainService.getTokenPriceByChainId(chainId);
  const tokenomics = await TokenomicsService.getTokenomicsByChainId(chainId);

  return (
    <div>
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <TokenPrice
        denom={chain?.denom ?? null}
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
