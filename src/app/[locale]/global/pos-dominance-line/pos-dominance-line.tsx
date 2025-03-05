'use client';
import { FC, useState } from 'react';
import TotalDominanceChart from './chartWidget';
import EcosystemSelector from './ecosystemSelector';
import SelectedEcosystems from './selectedEcosystem';
import ChartButtons from '@/app/validator_comparison/chart-buttons';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig'; // Import centralized ecosystem config

const PosDominanceLine: FC = () => {
  // Extract all ecosystems from the config (keys of ECOSYSTEMS_CONFIG)
  const allChains = Object.keys(ECOSYSTEMS_CONFIG);

  // State for the chart type, and the selected ecosystems
  const [chartType, setChartType] = useState<string>('Daily');
  const [selectedEcosystems, setSelectedEcosystems] = useState<string[]>(['POW', 'Cosmos', 'Polkadot', 'Ethereum']);

  return (
    <div className="flex flex-col w-full p-4 bg-gray-900">
      <div className="flex justify-center mb-4"> 
        {/* Ecosystem Selector */}
        <EcosystemSelector 
          ecosystems={allChains} 
          selected={selectedEcosystems} 
          onChange={setSelectedEcosystems} 
        />
        {/* Chart Type Buttons */}
        <ChartButtons
          isChart={false} // Add this line to pass the isChart prop
          onChartChanged={() => { }} // Add this line to pass the onChartChanged prop
          chartType={chartType}
          onTypeChanged={setChartType}
        />     
      </div>
      {/* Chart Widget - Displays the chart based on selected ecosystems */}
      <TotalDominanceChart
        chartType={chartType} 
        ecosystems={selectedEcosystems} 
      />
      {/* Selected Ecosystems - Displays selected ecosystems with their colors */}
      {/* <SelectedEcosystems ecosystems={selectedEcosystems} /> */}
    </div>
  );
};

export default PosDominanceLine;
