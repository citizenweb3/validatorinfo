import { FC, useState } from 'react';
import { ECOSYSTEMS_CONFIG} from './ecosystemConfig'; // Import ecosystem config

interface EcosystemSelectorProps {
  ecosystems: readonly string[]; // List of ecosystems available
  selected: string[]; // List of currently selected ecosystems
  onChange: (selected: string[]) => void; // Callback for updating selected ecosystems
}

const EcosystemSelector: FC<EcosystemSelectorProps> = ({ ecosystems, selected, onChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Toggle select/deselect of individual ecosystems
  const handleToggle = (ecosystem: string) => {
    onChange(selected.includes(ecosystem)
      ? selected.filter(e => e !== ecosystem)
      : [...selected, ecosystem]);
  };

  // Select all ecosystems
  const handleSelectAll = () => onChange([...ecosystems]);

  // Clear all selected ecosystems
  const handleClearAll = () => onChange([]);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="text-sm bg-gray-600 p-2 rounded text-white"
      >
        Select Ecosystem
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-700 text-white rounded-lg shadow-lg">
          <div className="flex flex-col p-2">
            <button onClick={handleSelectAll} className="text-sm bg-gray-600 p-2 rounded">
              Select All
            </button>
            <button onClick={handleClearAll} className="text-sm bg-gray-600 p-2 rounded mt-2">
              Clear All
            </button>
            {ecosystems.map(ecosystem => (
              <label key={ecosystem} className="flex items-center gap-2 text-sm p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(ecosystem)}
                  onChange={() => handleToggle(ecosystem)}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color }}
                />
                {ecosystem}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EcosystemSelector;
