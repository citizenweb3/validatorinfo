'use client';

import { FC, useState } from 'react';
import TotalDominanceChart from './dominanceChart';
import Dropdown from '@/app/components/common/list-filters/multiDropdown'; // Import Dropdown component (assuming it's in the same directory)
import ChartButtons from '@/app/comparevalidators/chart-buttons';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig'; // Import centralized ecosystem config

interface PosDominanceLineProps {
  chartType: string;
  setChartType: (type: string) => void;
}

const PosDominanceLine: FC<PosDominanceLineProps> = ({ chartType, setChartType }) => {
  // Extract all ecosystems from the config (keys of ECOSYSTEMS_CONFIG)
  const allChains = Object.keys(ECOSYSTEMS_CONFIG) as (keyof typeof ECOSYSTEMS_CONFIG)[];

  // State for the selected ecosystems

  // State for the selected ecosystems
  const [selectedEcosystems, setSelectedEcosystems] = useState<string[]>(['POW', 'Cosmos', 'Polkadot', 'Ethereum']);

  // Transform ecosystems to match Dropdown's format
  const dropdownItems = allChains.map((ecosystem) => ({
    value: ecosystem,
    title: ECOSYSTEMS_CONFIG[ecosystem]?.name || ecosystem, // Use the ecosystem name
    color: ECOSYSTEMS_CONFIG[ecosystem]?.color, // Add color from the config
  }));
  const handleTypeChange = (newType: string) => {
    if (["Daily", "Weekly", "Monthly", "Yearly"].includes(newType)) {
      setChartType(newType);
    }
  };
  // Handle the ecosystem selection change
  const handleSelectionChange = (value: string[]) => {
    setSelectedEcosystems(value); // Update selected ecosystems
  };

  return (
    <div className="flex flex-col w-full p-4 bg-gray-900">
      <div className="flex justify-center mb-4">
        {/* Ecosystem Selector */}
        <div className="mr-4">
          <Dropdown
            filterValues={dropdownItems}
            selectedValue={selectedEcosystems}
            onChanged={handleSelectionChange} // Pass the selected ecosystems as an array
            title="Ecosystems"
            maxSelectionLimit={4}
          />
        </div>
        {/* Chart Type Buttons */}
        <ChartButtons
          onlyDays={true}
          isChart={true}
          onChartChanged={() => { }}
          chartType={chartType}
          onTypeChanged={handleTypeChange}
          ecosystems={false}
        />
      </div>
      {/* Chart Widget - Displays the chart based on selected ecosystems */}
      <TotalDominanceChart
        chartType={chartType}
        ecosystems={selectedEcosystems} // Pass selected ecosystems to the chart widget
      />
    </div>
  );
};

export default PosDominanceLine;