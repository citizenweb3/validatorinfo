'use client';
import React, { FC, useState, useEffect } from 'react';
import PosDominanceLine from '@/app/web3stats/pos-dominance-line/pos-dominance-line';
import SubTitle from '@/components/common/sub-title';
import PosTotalChartWidget from '@/app/web3stats/pos-total-line/pos-total-line';
import PosCapitalizationBarChartWidget from '@/app/web3stats/pos-capitalization-bar/pos-capitalization-bar';

interface Web3statsChartsProps {
  translations: {
    dominance: string;
    total: string;
    cap: string;
  };
}

const Web3statsCharts: FC<Web3statsChartsProps> = ({ translations }) => {
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

export default Web3statsCharts;