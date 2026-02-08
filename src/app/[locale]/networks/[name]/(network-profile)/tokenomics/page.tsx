import { getTranslations } from 'next-intl/server';

import TokenPriceChart from '@/app/networks/[name]/(network-profile)/tokenomics/charts/token-price-chart';
import DistributionGiniParameters from '@/app/networks/[name]/(network-profile)/tokenomics/distribution-gini-parameters';
import TokenPrice from '@/app/networks/[name]/(network-profile)/tokenomics/token-price';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { mockPriceData } from '@/app/networks/[name]/(network-profile)/tokenomics/charts/mock-token-prices-data';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import TokenomicsService from '@/services/tokenomics-service';
import SubTitle from '@/components/common/sub-title';
import RoundedButton from '@/components/common/rounded-button';

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

  const mockDataMap: { [key: string]: any[] } = {
    cosmoshub: mockPriceData.cosmoshub,
    osmosis: mockPriceData.osmosis,
  };

  const priceHistory = mockDataMap[name] || mockPriceData.default;

  return (
    <div>
      <PageTitle prefix={chain?.prettyName ?? 'Network'} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="flex flex-row justify-between items-end">
        <SubTitle text={t('Token Price')} />
        <div className="flex flex-col gap-4">
          <RoundedButton className="text-lg" contentClassName="px-12">{t('Supply Concentration')}</RoundedButton>
          <RoundedButton className="text-lg" contentClassName="px-12">{t('Token Flow')}</RoundedButton>
        </div>
      </div>
      <div className="flex flex-col xl:flex-row gap-6">
        <TokenPrice
          denom={chain?.params?.denom ?? null}
          price={tokenPrice ? tokenPrice.value : 12.43}
          tokenomics={tokenomics}
        />
        <div className="flex-1 min-w-0">
          <TokenPriceChart priceHistory={priceHistory} chainName={chain?.name ?? name} />
        </div>
      </div>
      <DistributionGiniParameters chain={chain} />
    </div>
  );
};

export default NetworkTokenomicsPage;
