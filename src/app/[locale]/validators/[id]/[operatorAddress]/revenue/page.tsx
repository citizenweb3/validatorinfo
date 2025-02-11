import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import NodePagesTitle from '@/app/validators/[id]/[operatorAddress]/node-pages-title';
import NodeStakingCalculator from '@/app/validators/[id]/[operatorAddress]/revenue/node-staking-calculator';
import SlashingEventsDropDown from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-drop-down';
import StakingStats from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/staking-stats';
import SubTitle from '@/components/common/sub-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import validatorService from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'NodeRevenuePage' });

  return {
    title: t('title'),
  };
}

const NodeRevenuePage: NextPageWithLocale<PageProps> = async ({ params: { locale, id, operatorAddress } }) => {
  const t = await getTranslations({ locale, namespace: 'NodeRevenuePage' });

  const validatorId = parseInt(id);
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

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
