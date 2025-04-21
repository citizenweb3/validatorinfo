import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import NodeStakingCalculator from '@/app/validators/[id]/[operatorAddress]/revenue/node-staking-calculator';
import StakingStats from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/staking-stats';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import validatorService from '@/services/validator-service';
import TableDropdown from '@/components/common/table-dropdown';
import SlashingEventsTable from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-table';
import {
  slashingEventsExample,
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import SubDescription from '@/components/sub-description';

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
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
    <>
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="mb-12 mt-4 grid grid-cols-2 text-lg">
        <div>
          <SubTitle text={t('Staking Calculator')} />
          <Suspense fallback={<div>Loading...</div>}>
            <NodeStakingCalculator node={node} price={price ?? undefined} />
          </Suspense>
        </div>
        <div>
          <TableDropdown<SlashingEventsExampleInterface[]>
            page="NodeRevenuePage"
            Table={SlashingEventsTable}
            items={slashingEventsExample}
          />
        </div>
      </div>
      <SubTitle text={t('Staking Stats')} />
      <StakingStats locale={locale} page={'NodeRevenuePage'} />
    </>
  );
};

export default NodeRevenuePage;
