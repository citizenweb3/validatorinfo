import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import NodePagesTitle from '@/app/validators/[identity]/[operatorAddress]/node-pages-title';
import NodeStakingCalculator from '@/app/validators/[identity]/[operatorAddress]/revenue/node-staking-calculator';
import SlashingEventsDropDown from '@/app/validators/[identity]/[operatorAddress]/revenue/slashing-events/slashing-events-drop-down';
import StakingStats from '@/app/validators/[identity]/[operatorAddress]/revenue/stacking-stats-table/staking-stats';
import SubTitle from '@/components/common/sub-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import ValidatorService from '@/services/validator-service';

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
      <div className="mt-4">
        <SubTitle text={t('Staking Calculator')} />
      </div>
      <div className="mb-8 mt-4 flex justify-center text-lg">
        <Suspense fallback={<div>Loading...</div>}>
          <NodeStakingCalculator node={node} price={price ?? undefined} />
        </Suspense>
      </div>
      <SubTitle text={t('Staking Stats')} />
      <StakingStats locale={locale} page={'NodeRevenuePage'} />
      <SlashingEventsDropDown />
    </div>
  );
};

export default NodeRevenuePage;
