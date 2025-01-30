'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import ChartButtons from '@/app/validator_comparison/chart-buttons';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  identity: string;
}

const GlobalRevenue: FC<OwnProps> = ({ identity }) => {
  const t = useTranslations('ValidatorRevenuePage');
  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<string | undefined>('Daily');

  const handleChartChanged = (value: boolean) => {
    setIsChart(value);
    if (!value) {
      setChartType(undefined);
    } else {
      setChartType('Daily');
    }
  };
  return (
    <div className="mt-6">
      <div className="flex justify-center space-x-4">
        <ChartButtons
          onlyDays
          ecosystems={false}
          isChart={isChart}
          onChartChanged={handleChartChanged}
          chartType={chartType}
          onTypeChanged={(name) => setChartType(name)}
        />
      </div>
      <Tooltip tooltip={t('tooltip global revenue')} direction={'top'}>
        <div className="mt-7 flex items-center justify-between px-4 py-1 shadow-button">
          <div className="font-sfpro text-lg">{t('global revenue')}:</div>
          <div className="mx-auto px-20 font-handjet text-xl font-light text-highlight">$12.43K</div>
        </div>
      </Tooltip>
    </div>
  );
};

export default GlobalRevenue;
