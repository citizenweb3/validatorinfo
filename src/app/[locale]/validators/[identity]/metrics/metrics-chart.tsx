'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

import ChartButtons from '@/app/validator_comparison/chart-buttons';

const MetricsChartLine: FC = () => {
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
    <div className="mt-20">
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
      <Image
        src={'/img/charts/metrics-chart.svg'}
        width={1345}
        height={317}
        alt="tem chart 1"
        className="mt-8 w-full px-16"
      />
    </div>
  );
};

export default MetricsChartLine;
