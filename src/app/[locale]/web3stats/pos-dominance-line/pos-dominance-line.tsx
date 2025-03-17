'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

import ChartButtons from '@/app/comparevalidators/chart-buttons';

const PosDominanceLine: FC = () => {
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
    <div>
      <div className="flex items-center justify-center">
        <ChartButtons
          onlyDays
          ecosystems
          isChart={isChart}
          onChartChanged={handleChartChanged}
          chartType={chartType}
          onTypeChanged={(name) => setChartType(name)}
        />
      </div>
      <Image
        src={'/img/charts/pos-chart-1.svg'}
        width={1342}
        height={317}
        alt="tem chart 1"
        className="mt-8 w-full px-16"
      />
    </div>
  );
};

export default PosDominanceLine;
