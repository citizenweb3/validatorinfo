import { FC } from 'react';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig'; // Import ecosystem configuration

interface SelectedEcosystemsProps {
  ecosystems: string[]; // List of selected ecosystems
}

const SelectedEcosystems: FC<SelectedEcosystemsProps> = ({ ecosystems }) => (
  <div className="flex justify-center flex-wrap gap-4">
    {ecosystems.map(ecosystem => (
      <div key={ecosystem} className="flex items-center gap-2">
        <div
          className="w-4 h-4 border-2 border-white"  // Square boxes with white border
          style={{ backgroundColor: (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color }} // Use color from the configuration
        />
        <span className="text-sm text-gray-200">{ecosystem}</span>
      </div>
    ))}
  </div>
);

export default SelectedEcosystems;
