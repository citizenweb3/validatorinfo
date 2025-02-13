import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import ToolTip from '@/components/common/tooltip';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';

interface OwnProps {
}

const NetworkHeaderMetricsBlocks: FC<OwnProps> = async ({}) => {
  const t = await getTranslations('NetworkProfileHeader');

  return (
    <div className="mt-16 flex w-full justify-center gap-6">
      <ToolTip tooltip={t('tvl tooltip')} direction={'top'}>
        <MetricsCardItem title={'TVL'} data={'90'} isModal />
      </ToolTip>
      <ToolTip tooltip={t('revenue tooltip')} direction={'top'}>
        <MetricsCardItem title={t('Revenue')} data={'90'} isModal />
      </ToolTip>
      <ToolTip tooltip={t('validator cost tooltip')} direction={'top'}>
        <MetricsCardItem title={t('Validator Cost')} data={'90'} isModal />
      </ToolTip>
    </div>
  );
};

export default NetworkHeaderMetricsBlocks;
