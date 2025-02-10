// import { FC, useState } from 'react';
// // import { ECOSYSTEMS_CONFIG } from './ecosystemConfig';

// interface EcosystemSelectorProps {
//   ecosystems: readonly string[];
//   selected: string[];
//   onChange: (selected: string[]) => void;
// }

// const EcosystemSelector: FC<EcosystemSelectorProps> = ({ ecosystems, selected, onChange }) => {
//   const [dropdownOpen, setDropdownOpen] = useState(false);

//   const handleToggle = (ecosystem: string) => {
//     onChange(selected.includes(ecosystem)
//       ? selected.filter(e => e !== ecosystem)
//       : [...selected, ecosystem]);
//   };

//   const handleSelectAll = () => onChange([...ecosystems]);
//   const handleClearAll = () => onChange([]);

//   return (
//     <div className="relative inline-block text-left">
//       <button
//         onClick={() => setDropdownOpen(!dropdownOpen)}
//         className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-yellow-400 rounded-lg shadow-md hover:bg-gray-700 transition-all"
//       >
//         Ecosystems
//         <span className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
//           ▼
//         </span>
//       </button>
      
//       {dropdownOpen && (
//         <div className="absolute right-0 mt-2 w-56 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 z-10">
//           <div className="flex flex-col p-3">
//             <button 
//               onClick={handleSelectAll} 
//               className="text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded mb-2 w-full text-left"
//             >
//               Select All
//             </button>
//             <button 
//               onClick={handleClearAll} 
//               className="text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded mb-2 w-full text-left"
//             >
//               Clear All
//             </button>
//             <div className="mt-2">
//               {ecosystems.map(ecosystem => (
//                 <label key={ecosystem} className="flex items-center gap-2 text-sm p-2 cursor-pointer hover:bg-gray-800 rounded">
//                   {/* Radio button removed, and just the ecosystem name displayed as a button */}
//                   <input
//                     type="radio"
//                     name="ecosystem"
//                     checked={selected.includes(ecosystem)}
//                     onChange={() => handleToggle(ecosystem)}
//                     className="form-radio text-yellow-400 hidden"
//                   />
//                   {/* The colored circle is commented out */}
//                   {/* <div
//                     className="w-3 h-3 rounded-full"
//                     style={{ backgroundColor: (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color }}
//                   /> */}
//                   <button
//                     onClick={() => handleToggle(ecosystem)}
//                     className={`p-2 rounded bg-gray-700 text-white hover:bg-gray-600 ${selected.includes(ecosystem) ? 'bg-yellow-400' : ''}`}
//                   >
//                     {ecosystem}
//                   </button>
//                 </label>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EcosystemSelector;



// max 4 ecosystems
import { FC, useState } from 'react';
import { ECOSYSTEMS_CONFIG } from './ecosystemConfig'; // Import ecosystem configuration

interface EcosystemSelectorProps {
  ecosystems: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const EcosystemSelector: FC<EcosystemSelectorProps> = ({ ecosystems, selected, onChange }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const maxSelectionLimit = 4; // Maximum selections allowed

  const handleToggle = (ecosystem: string) => {
    // Check if the ecosystem is already selected
    if (selected.includes(ecosystem)) {
      // Remove ecosystem if it's already selected
      onChange(selected.filter(e => e !== ecosystem));
    } else {
      // Prevent selecting more than 4 ecosystems
      if (selected.length < maxSelectionLimit) {
        onChange([...selected, ecosystem]);
      }
    }
  };

  const handleSelectAll = () => onChange([...ecosystems].slice(0, maxSelectionLimit));  // Limit to maxSelectionLimit
  const handleClearAll = () => onChange([]);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-yellow-400 rounded-lg shadow-md hover:bg-gray-700 transition-all"
      >
        Ecosystems
        <span className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
          ▼
        </span>
      </button>
      
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 z-10">
          <div className="flex flex-col p-3">
            <button 
              onClick={handleSelectAll} 
              className="text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded mb-2 w-full text-left"
            >
              Select All
            </button>
            <button 
              onClick={handleClearAll} 
              className="text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded mb-2 w-full text-left"
            >
              Clear All
            </button>
            <div className="mt-2">
              {ecosystems.map(ecosystem => (
                <label key={ecosystem} className="flex items-center gap-2 text-sm p-2 cursor-pointer hover:bg-gray-800 rounded">
                  <button
                    onClick={() => handleToggle(ecosystem)}
                    className={`p-2 rounded text-white hover:bg-gray-600 ${selected.includes(ecosystem) ? '' : 'bg-gray-700'}`}
                    style={{
                      color: selected.includes(ecosystem) ? (ECOSYSTEMS_CONFIG as any)[ecosystem]?.color : '', // Apply color from the config if selected
                    }}
                    disabled={selected.length >= maxSelectionLimit && !selected.includes(ecosystem)} // Disable button if max limit reached
                  >
                    {ecosystem}
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcosystemSelector;
