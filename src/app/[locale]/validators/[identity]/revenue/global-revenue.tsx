'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import ChartButtons from '@/app/validator_comparison/chart-buttons';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  identity: string;
}

const GlobalRevenue: FC<OwnProps> = ({identity}) => {
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
    <div className="mt-8">
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
        <div className="mt-7 flex shadow-button justify-between items-center px-4 py-1">
          <div className="font-sfpro text-lg">{t('global revenue')}:</div>
          <div className="font-handjet text-xl text-highlight px-20 mx-auto">$12.43K</div>
        </div>
      </Tooltip>
    </div>
  );
};

export default GlobalRevenue;
