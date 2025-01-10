'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import ChartButtons from '@/app/validator_comparison/chart-buttons';

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
      <div className="mt-7 flex shadow-button justify-between items-center px-4 py-1">
        <div className="font-sfpro text-lg">{t('global revenue')}:</div>
        <div className="font-handjet text-xl text-highlight px-20 mx-auto">$12.43K</div>
      </div>
    </div>
  );
};

export default GlobalRevenue;
