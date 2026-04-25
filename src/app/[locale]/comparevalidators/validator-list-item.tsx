import { FC, useState } from 'react';

import { ValidatorDataFilled } from '@/app/comparevalidators/get-validator-data';
import ValidatorItemRow from '@/app/comparevalidators/validator-item-row';
import LineChart from '@/components/charts/line-chart';
import BaseModal from '@/components/common/modal/base-modal';
import TriangleButton from '@/components/common/triangle-button';

interface OwnProps {
  item: ValidatorDataFilled;
  chartType: string | undefined;
  isChart: boolean;
  onRemove: () => void;
  list: { value: string; title: string }[];
  exists: string[];
  onChange: (name: string) => void;
}

const ValidatorListItem: FC<OwnProps> = ({ item, onRemove, isChart, onChange, list, exists }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredList = list
    .filter((v) => !exists.includes(v.value) || v.value === item.moniker)
    .filter((v) => v.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handlePick = (name: string) => {
    onChange(name);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="flex max-w-96 flex-grow flex-col">
      <ValidatorItemRow className="!min-h-20 border-b border-bgSt">
        <div className="relative flex w-full items-center justify-center">
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove validator"
            className="absolute -top-3 right-0 text-base leading-none text-text/60 hover:text-highlight"
          >
            ✕
          </button>
          <div
            onClick={() => setIsOpen(true)}
            className="flex cursor-pointer flex-row items-center gap-2"
          >
            <span className="text-highlight">{item.moniker}</span>
            <TriangleButton direction={isOpen ? 't' : 'b'} />
          </div>
          <BaseModal opened={isOpen} onClose={() => setIsOpen(false)} maxHeight="max-h-[40vh]">
            <div className="min-w-60 space-y-1 text-base">
              <div className="sticky top-0 z-10 bg-background">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mx-2 my-2 h-6 w-full cursor-text border-b border-b-primary bg-background bg-search bg-contain bg-no-repeat py-2 pl-8 font-sfpro text-base hover:bg-search_h focus:outline-none"
                />
              </div>
              <div className="overflow-y-auto">
                {filteredList.length > 0 ? (
                  filteredList.map((v) => (
                    <div
                      key={v.value}
                      onClick={() => handlePick(v.value)}
                      className={`cursor-pointer px-4 py-2 ${v.value === item.moniker ? 'text-highlight' : ''}`}
                    >
                      {v.title}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2">No results found</div>
                )}
              </div>
            </div>
          </BaseModal>
        </div>
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.healthChange.color}`}>{item.healthChange.value}%</ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.technicalScoreChanges.color}`}>
        {item.technicalScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.TVSGovernanceScoreChanges.color}`}>
        {item.TVSGovernanceScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.userScoreChanges.color}`}>
        {item.userScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.socialScoreChanges.color}`}>
        {item.socialScoreChanges.value}%
      </ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.badges.color}`}>{item.badges.value}</ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.reviews.color}`}>{item.reviews.value}</ValidatorItemRow>
      <ValidatorItemRow className={`text-${item.tagsInTheWild.color}`}>{item.tagsInTheWild.value}</ValidatorItemRow>
      <ValidatorItemRow>
        {isChart && (
          <LineChart
            data={item.TVSGrowthChartData}
            width={192}
            height={48}
            startColor="#414141"
            endColor="#52B550"
            shadowColor="rgba(0, 0, 0, 0.3)"
            className="h-12 w-48"
          />
        )}
      </ValidatorItemRow>
      <ValidatorItemRow>
        {isChart && (
          <LineChart
            data={item.fanGrowthChartData}
            width={192}
            height={48}
            startColor="#414141"
            endColor="#52B550"
            shadowColor="rgba(0, 0, 0, 0.3)"
            className="h-12 w-48"
          />
        )}
      </ValidatorItemRow>
    </div>
  );
};

export default ValidatorListItem;
