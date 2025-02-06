import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsAssetsModal from '@/app/validators/[id]/metrics/metrics-blocks/metrics-assets-modal';
import MetricsBlocksModal from '@/app/validators/[id]/metrics/metrics-blocks/metrics-blocks-modal';
import { validatorExample } from '@/app/validators/[id]/validatorExample';
import ToolTip from '@/components/common/tooltip';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface OwnProps {
  id: number;
}

const MetricsBlocks: FC<OwnProps> = async ({ id }) => {
  const t = await getTranslations('ValidatorMetricsPage');

  const sortBy: string = 'prettyName';
  const order: SortDirection = 'asc';
  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(id, sortBy, order);

  const cardClass = `
  flex flex-col items-center bg-card pt-2.5 
  min-w-[200px] max-w-[280px] flex-1 
  md:max-w-[200px] 
  lg:max-w-[200px] 
  xl:max-w-[230px] 
  2xl:max-w-[250px]
`;
  const cardTitleClass = 'text-center text-base text-highlight';
  const cardValueClass = 'mt-3 font-handjet text-lg';
  const formulaUrl = '/img/tmp/formula.svg';

  return (
    <div className="mt-12 flex flex-col items-center gap-8">
      <div className="flex w-full justify-center gap-8">
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('technical score')}</div>
          <div className={cardValueClass}>{validatorExample.metrics.technicalScore}</div>
          <MetricsBlocksModal formulaUrl={formulaUrl} title={t('explanation')} />
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('social score')}</div>
          <div className={cardValueClass}>{validatorExample.metrics.socialScore}</div>
          <MetricsBlocksModal formulaUrl={formulaUrl} title={t('explanation')} />
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('governance score')}</div>
          <div className={cardValueClass}>{validatorExample.metrics.governanceScore}</div>
          <MetricsBlocksModal formulaUrl={formulaUrl} title={t('explanation')} />
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('user score')}</div>
          <div className={cardValueClass}>{validatorExample.metrics.userScore}</div>
          <MetricsBlocksModal formulaUrl={formulaUrl} title={t('explanation')} />
        </div>
      </div>
      <div className="flex w-full justify-center gap-8">
        <div className={cardClass}>
          <ToolTip tooltip={t('tvs tooltip')} direction={'top'}>
            <div className={cardTitleClass}>{t('TVS')}</div>
          </ToolTip>
          <div className={cardValueClass}>${validatorExample.metrics.TVS}</div>
        </div>
        <div className={cardClass}>
          <ToolTip tooltip={t('fans tooltip')} direction={'top'}>
            <div className={cardTitleClass}>{t('fans')}</div>
          </ToolTip>
          <div className={cardValueClass}>{validatorExample.metrics.fans.toLocaleString('en-Us')}</div>
        </div>
        <div className={cardClass}>
          <div className={cardTitleClass}>{t('amount of assets')}</div>
          <div className={cardValueClass}>{list.length}</div>
          <MetricsAssetsModal list={list} />
        </div>
      </div>
    </div>
  );
};

export default MetricsBlocks;
