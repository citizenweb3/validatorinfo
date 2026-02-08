import dynamic from 'next/dynamic';
import { getTranslations } from 'next-intl/server';

import DistributionGiniParameters
  from '@/app/networks/[name]/(network-profile)/tokenomics/distribution-gini-parameters';
import TokenPrice from '@/app/networks/[name]/(network-profile)/tokenomics/token-price';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import UnderDevelopment from '@/components/common/under-development';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import priceHistoryService from '@/services/price-history-service';
import TokenomicsService from '@/services/tokenomics-service';
import SubTitle from '@/components/common/sub-title';
import RoundedButton from '@/components/common/rounded-button';

const TokenPriceChart = dynamic(
  () => import('@/app/networks/[name]/(network-profile)/tokenomics/charts/token-price-chart'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center rounded bg-table_row">
        <div className="font-sfpro text-lg text-white opacity-70">Loading chart...</div>
      </div>
    ),
  },
);

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
  const chartData = chain ? await priceHistoryService.getChartData(chain.id) : [];

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
          price={tokenPrice ? tokenPrice.value : null}
          tokenomics={tokenomics}
        />
        <div className="flex-1 min-w-0">
          {chartData.length > 0 ? (
            <TokenPriceChart chartData={chartData} />
          ) : (
            <div className="mt-6 ml-20">
              <UnderDevelopment title={t('No chart data available')} size="lg" />
            </div>
          )}
        </div>
      </div>
      <DistributionGiniParameters chain={chain} />
    </div>
  );
};

export default NetworkTokenomicsPage;
