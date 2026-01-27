import { getTranslations } from 'next-intl/server';
import { FC, Suspense } from 'react';

import { getValidatorSlashingEvents } from '@/actions/get-validator-slashing-events';
import NodeStakingCalculator from '@/app/validators/[id]/[operatorAddress]/revenue/node-staking-calculator';
import {
  AztecSlashingEventDisplay,
  convertToDisplayFormat,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/aztec-slashing-types';
import SlashingEventsTable from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashing-events-table';
import {
  slashingEventsExample,
  SlashingEventsExampleInterface,
} from '@/app/validators/[id]/[operatorAddress]/revenue/slashing-events/slashingEventsExample';
import StakingStats from '@/app/validators/[id]/[operatorAddress]/revenue/stacking-stats-table/staking-stats';
import SubTitle from '@/components/common/sub-title';
import TableDropdown from '@/components/common/table-dropdown';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import validatorService from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
}

const NodeRevenuePage: NextPageWithLocale<PageProps> = async ({ params: { locale, id, operatorAddress } }) => {
  const t = await getTranslations({ locale, namespace: 'NodeRevenuePage' });

  const validatorId = parseInt(id);
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  let price;
  let slashingEvents: AztecSlashingEventDisplay[] = [];
  let isAztecNetwork = false;

  if (node) {
    price = await chainService.getTokenPriceByChainId(node.chainId);

    const chain = await chainService.getById(node.chainId);
    if (chain && (chain.name === 'aztec' || chain.name === 'aztec-testnet')) {
      isAztecNetwork = true;
      const slashingData = await getValidatorSlashingEvents({
        chainId: chain.id,
        operatorAddress: operatorAddress,
        limit: 10,
      });

      if (slashingData) {
        slashingEvents = slashingData.events.map((event) => convertToDisplayFormat(event, slashingData.tokenPrice));
      }
    }
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
          {isAztecNetwork ? (
            <TableDropdown<AztecSlashingEventDisplay[]>
              page="NodeRevenuePage"
              Table={SlashingEventsTable as FC<{ items: AztecSlashingEventDisplay[] }>}
              items={slashingEvents}
            />
          ) : (
            <TableDropdown<SlashingEventsExampleInterface[]>
              page="NodeRevenuePage"
              Table={SlashingEventsTable as FC<{ items: SlashingEventsExampleInterface[] }>}
              items={slashingEventsExample}
            />
          )}
        </div>
      </div>
      <SubTitle text={t('Staking Stats')} />
      <StakingStats locale={locale} page={'NodeRevenuePage'} />
    </>
  );
};

export default NodeRevenuePage;
