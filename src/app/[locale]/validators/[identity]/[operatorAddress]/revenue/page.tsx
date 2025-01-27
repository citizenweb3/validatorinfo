import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import NodePagesTitle from '@/app/validators/[identity]/[operatorAddress]/node-pages-title';
import NodeStakingCalculator from '@/app/validators/[identity]/[operatorAddress]/revenue/node-staking-calculator';
import SubTitle from '@/components/common/sub-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { identity: string; operatorAddress: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NodeRevenuePage' });

  return {
    title: t('title'),
  };
}

const NodeRevenuePage: NextPageWithLocale<PageProps> = async ({ params: { locale, identity, operatorAddress } }) => {
  const t = await getTranslations({ locale, namespace: 'NodeRevenuePage' });

  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === operatorAddress);

  let price;
  if (node) {
    price = await chainService.getTokenPriceByChainId(node.chainId);
  }

  return (
    <div>
      <NodePagesTitle page={'NodeRevenuePage'} locale={locale} node={node} />
      <SubTitle text={t('Staking Calculator')} />
      <div className="mt-4 flex justify-center text-lg">
        <Suspense fallback={<div>Loading...</div>}>
          {node && price ? <NodeStakingCalculator node={node} price={price} /> : <NodeStakingCalculator />}
        </Suspense>
      </div>
    </div>
  );
};

export default NodeRevenuePage;
