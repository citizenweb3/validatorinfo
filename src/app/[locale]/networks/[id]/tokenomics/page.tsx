import { getTranslations } from 'next-intl/server';

import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import TokenPrice from '@/app/networks/[id]/tokenomics/token-price';
import DistributionGiniParameters from '@/app/networks/[id]/tokenomics/distribution-gini-parameters';

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

  return (
    <div>
      <PageTitle prefix={`${chain?.prettyName}:` ?? 'Network:'} text={t('title')} />
      <TokenPrice denom={chain?.denom} price={tokenPrice ? tokenPrice.value : 12.43} />
      <DistributionGiniParameters />
    </div>
  );
};

export default NetworkTokenomicsPage;
