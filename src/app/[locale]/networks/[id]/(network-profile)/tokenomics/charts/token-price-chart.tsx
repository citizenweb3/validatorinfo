'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

import ChartButtons from '@/app/comparevalidators/chart-buttons';

const TokenPriceChart: FC = () => {
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
    <div className="mt-3 mb-12">
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
        src={'/img/charts/token-price-chart.svg'}
        width={1300}
        height={300}
        alt="tem chart 1"
        className="mt-3 w-full px-20"
      />
    </div>
  );
};

export default TokenPriceChart;
