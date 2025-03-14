'use client';

import { useTranslations } from 'next-intl';
import { FC, useEffect, useState } from 'react';

import ValidatorEmptyItem from '@/app/comparevalidators/ValidatorEmptyItem';
import ChartButtons from '@/app/comparevalidators/chart-buttons';
import ComparisonPanel from '@/app/comparevalidators/comparison-panel';
import getValidatorData, { ValidatorData, ValidatorDataFilled } from '@/app/comparevalidators/get-validator-data';
import { fillColors } from '@/app/comparevalidators/helpers';
import ValidatorLeftPanel from '@/app/comparevalidators/validator-left-panel';
import ValidatorListItem from '@/app/comparevalidators/validator-list-item';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {}

const validatorList = [
  { value: 'POSTHUMAN', title: 'POSTHUMAN' },
  { value: 'Bro_n_Bro', title: 'Bro_n_Bro' },
  { value: 'Imperator', title: 'Imperator' },
  { value: '01node', title: '01node' },
  { value: 'Stakeflow', title: 'Stakeflow' },
  { value: 'PUPMØS', title: 'PUPMØS' },
  { value: 'Citadel.one', title: 'Citadel.one' },
];

const ComparisonTable: FC<OwnProps> = ({}) => {
  const t = useTranslations('ComparisonPage');
  const [data, setData] = useState<ValidatorData[]>([]);
  const [filledData, setFilledData] = useState<ValidatorDataFilled[]>([]);
  const [isChart, setIsChart] = useState<boolean>(false);
  const [chartType, setChartType] = useState<string | undefined>('Daily');
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);

  useEffect(() => {
    const first = [getValidatorData(0, 'Citizen Web 3')];
    setData(first);
  }, []);

  useEffect(() => {
    setFilledData(fillColors(data));
  }, [data]);

  const handleAdd = (name: string) => {
    setData((state) => [...state, getValidatorData(data.length, name)]);
    setIsChanged(true);
  };

  const handleChange = (index: number, name: string) => {
    setData([...data.slice(0, index), getValidatorData(index, name), ...data.slice(index + 1)]);
    setIsChanged(true);
  };

  const handleRemove = (id: number) => {
    setData((state) => state.filter((v) => v.id !== id));
    setIsChanged(true);
  };

  const handleReset = () => {
    setData([getValidatorData(0, 'Citizen Web 3')]);
    setChartType('Daily');
    setIsChanged(false);
    setIsComparing(false);
  };

  const handleChartChanged = (value: boolean) => {
    setIsChart(value);
    if (!value) {
      setChartType(undefined);
    } else {
      setChartType('Daily');
    }
    setIsChanged(true);
  };

  return (
    <>
      <div className="mt-2 flex items-end justify-center">
        <ChartButtons
          onlyDays
          isChart={isChart}
          onChartChanged={handleChartChanged}
          chartType={chartType}
          onTypeChanged={(name) => {
            setIsChanged(true);
            setChartType(name);
          }}
        />
      </div>
      <div className="mt-10 flex flex-grow flex-row text-base">
        <ValidatorLeftPanel isChart={isChart} />
        {filledData.map((item, index) => (
          <ValidatorListItem
            onRemove={() => handleRemove(item.id)}
            list={validatorList}
            exists={data.map((v) => v.moniker)}
            onChange={(name: string) => handleChange(index, name)}
            key={item.id}
            item={item}
            chartType={chartType}
            isChart={isChart}
          />
        ))}
        {filledData.length < 3 && (
          <div className="max-w-60">
            <ValidatorEmptyItem
              name={t('Add')}
              list={validatorList}
              exists={data.map((v) => v.moniker)}
              onAdd={handleAdd}
            />
          </div>
        )}
        <div className="flex-grow"></div>
        {filledData.length > 1 && (
          <div className="flex flex-col items-end space-y-6 text-lg">
            <ComparisonPanel
              validator={filledData[0]?.moniker}
              isComparing={isComparing}
              onCompare={() => setIsComparing(!isComparing)}
            />
            {isChanged && (
              <RoundedButton contentClassName="px-20 text-lg" onClick={handleReset}>
                {t('Reset')}
              </RoundedButton>
            )}
            {isComparing && <RoundedButton contentClassName="px-20 text-lg">{t('Share result')}</RoundedButton>}
            {filledData.length > 0 && (
              <RoundedButton contentClassName="px-20 text-2xl" onClick={() => setIsChart(!isChart)}>
                {t(isChart ? 'Hide Charts' : 'Show Charts')}
              </RoundedButton>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ComparisonTable;
