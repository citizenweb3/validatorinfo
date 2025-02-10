'use client';
import { FC, useState } from 'react';
import PosTotalChartWidget from './totalLineChart';
import ChartButtons from '@/app/validator_comparison/chart-buttons';

const PosDominanceLine: FC = () => {
    // State for the chart type, and the selected ecosystems
    const [chartType, setChartType] = useState<string>('Daily');

  return (
    <div className="flex flex-col w-full p-4 bg-gray-900">
      <div className="flex justify-center mb-4">
        {/* Chart Type Buttons */}
        <ChartButtons
          isChart={false} // Add this line to pass the isChart prop
          onChartChanged={() => { }} // Add this line to pass the onChartChanged prop
          chartType={chartType}
          onTypeChanged={setChartType}
        />   
      </div>
      <div className="flex justify-center mb-4">  
      <PosTotalChartWidget 
        chartType={chartType} 
      />
      </div>
    </div>
  );
};

export default PosDominanceLine;
