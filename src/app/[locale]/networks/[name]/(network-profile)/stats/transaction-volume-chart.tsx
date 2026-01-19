'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import ChartButtons from '@/app/comparevalidators/chart-buttons';

const TransactionVolumeChart: FC = () => {
  const t = useTranslations('NetworkStatistics');
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
    <div className="mt-6 mb-14">
      <div className="flex items-center justify-center">
        <ChartButtons
          onlyDays
          ecosystems={false}
          isChart={isChart}
          onChartChanged={handleChartChanged}
          chartType={chartType}
          onTypeChanged={(name) => setChartType(name)}
        />
      </div>
      <div
        className="mx-20 mt-3 flex items-center justify-center rounded border border-[#3E3E3E]"
        style={{
          height: '300px',
          backgroundColor: '#1E1E1E',
        }}
      >
        <p className="px-8 text-center font-sfpro text-base text-white/70">
          {t('chart unavailable')}
        </p>
      </div>
    </div>
  );
};

export default TransactionVolumeChart;
