import { FC } from 'react';

import ValidatorEmptyItem from '@/app/validator_comparison/ValidatorEmptyItem';
import { ValidatorDataFilled } from '@/app/validator_comparison/get-validator-data';
import ValidatorItemRow from '@/app/validator_comparison/validator-item-row';
import LineChart from '@/components/charts/line-chart';
import PlusButton from '@/components/common/plus-button';

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
  return (
    <div className="flex max-w-96 flex-grow flex-col">
      <ValidatorItemRow className="!min-h-20 border-b border-bgSt text-highlight">
        <div className="overflow-x-hidden text-ellipsis text-nowrap">{item.moniker}</div>
        <div className="text-white">
          <ValidatorEmptyItem onAdd={onChange} list={list} exists={exists} />
        </div>
        <div className="-mt-20">
          <PlusButton size="sm" isOpened={true} onClick={onRemove} />
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
