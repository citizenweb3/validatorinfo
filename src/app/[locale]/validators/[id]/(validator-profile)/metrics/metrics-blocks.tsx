import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { validatorExample } from '@/app/validators/[id]/(validator-profile)/validatorExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import ToolTip from '@/components/common/tooltip';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';

interface OwnProps {
  id: number;
}

const MetricsBlocks: FC<OwnProps> = async ({ id }) => {
  const t = await getTranslations('ValidatorMetricsPage');

  const sortBy: string = 'prettyName';
  const order: SortDirection = 'asc';
  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(
    id,
    [],
    [],
    sortBy,
    order,
  );

  const cardClass = `
      pt-2.5 
      sm:min-h-[45px] 
      sm:min-h-[55px] 
      md:min-h-[63px] 
      lg:min-h-[75px]
      xl:min-h-[80px]
      2xl:min-h-[94px]`;
  const cardValueClass = 'mt-3';
  const formulaUrl = '/img/tmp/formula.svg';

  return (
    <div className="mt-12 flex flex-col items-center gap-8">
      <div className="flex w-full justify-center gap-8">
        <MetricsCardItem
          title={t('technical score')}
          data={validatorExample.metrics.technicalScore}
          isModal
          modalTitle={t('explanation')}
          modalItem={formulaUrl}
          className={cardClass}
          dataClassName={cardValueClass}
        />
        <MetricsCardItem
          title={t('social score')}
          data={validatorExample.metrics.socialScore}
          isModal
          modalTitle={t('explanation')}
          modalItem={formulaUrl}
          className={cardClass}
          dataClassName={cardValueClass}
        />
        <MetricsCardItem
          title={t('governance score')}
          data={validatorExample.metrics.governanceScore}
          isModal
          modalTitle={t('explanation')}
          modalItem={formulaUrl}
          className={cardClass}
          dataClassName={cardValueClass}
        />
        <MetricsCardItem
          title={t('user score')}
          data={validatorExample.metrics.userScore}
          isModal
          modalTitle={t('explanation')}
          modalItem={formulaUrl}
          className={cardClass}
          dataClassName={cardValueClass}
        />
      </div>
      <div className="flex w-full justify-center gap-8">
        <ToolTip tooltip={t('tvs tooltip')} direction={'top'}>
          <MetricsCardItem
            key={validatorExample.metrics.TVS}
            title={t('TVS')}
            data={`$${validatorExample.metrics.TVS}`}
            className={cardClass}
            dataClassName={cardValueClass}
          />
        </ToolTip>

        <ToolTip tooltip={t('fans tooltip')} direction={'top'}>
          <MetricsCardItem
            key={validatorExample.metrics.fans}
            title={t('fans')}
            data={validatorExample.metrics.fans.toLocaleString('en-Us')}
            className={cardClass}
            dataClassName={cardValueClass}
          />
        </ToolTip>

        <MetricsCardItem
          key={list.length}
          title={t('amount of assets')}
          data={list.length}
          isModal
          modalItem={list}
          className={cardClass}
          dataClassName={cardValueClass}
        />
      </div>
    </div>
  );
};

export default MetricsBlocks;
