'use client';
import React, { FC, useState, useEffect } from 'react';
import PosDominanceLine from '@/app/global/pos-dominance-line/pos-dominance-line';
import SubTitle from '@/components/common/sub-title';
import PosTotalChartWidget from '@/app/global/pos-total-line/totalLineChart';
import PosCapitalizationBarChartWidget from '@/app/global/pos-capitalization-bar/posCapitalizationBarChartWidget';

interface GlobalChartsProps {
  translations: {
    dominance: string;
    total: string;
    cap: string;
  };
}

const GlobalCharts: FC<GlobalChartsProps> = ({ translations }) => {
  const [chartType, setChartType] = useState<string>('Daily');

  return (
    <div>
      <div className="mb-16 mt-20">
        <SubTitle text={translations.dominance}size="h2" />
      </div>
      <div className="flex w-full flex-row space-x-14">
        <PosDominanceLine chartType={chartType} setChartType={setChartType} />
      </div>
      <div className="mb-16 mt-20">
        <SubTitle text={translations.total} size="h2" />
      </div>
      <div className="flex flex-col w-full p-4 bg-gray-900">
      <div className="flex justify-center mb-4">  
      <PosTotalChartWidget 
        chartType={chartType} 
      />
      </div>
    </div>
      <div className="mb-16 mt-20">
        <SubTitle text={translations.cap} size="h2" />
      </div>
      <div className="flex flex-col w-full p-4 bg-gray-900">
      <div className="flex justify-center mb-4">  
      <PosCapitalizationBarChartWidget 
        chartType={chartType} 
      />
      </div>
    </div>
    </div>
  );
};

export default GlobalCharts;
