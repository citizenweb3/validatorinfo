'use client';

import { Validator } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { FC, useEffect, useState } from 'react';

import SpreadModal from '@/app/about/modals/spread-modal';
import ValidatorEmptyItem from '@/app/comparevalidators/ValidatorEmptyItem';
import ComparisonPanel from '@/app/comparevalidators/comparison-panel';
import getValidatorData, { ValidatorData, ValidatorDataFilled } from '@/app/comparevalidators/get-validator-data';
import { fillColors } from '@/app/comparevalidators/helpers';
import ValidatorLeftPanel from '@/app/comparevalidators/validator-left-panel';
import ValidatorListItem from '@/app/comparevalidators/validator-list-item';
import RoundedButton from '@/components/common/rounded-button';
import { cn } from '@/utils/cn';

const chartTypeNames = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const;
type ChartTypeName = (typeof chartTypeNames)[number];

interface OwnProps {
  validator: Validator | null;
}

const validatorList = [
  { value: 'POSTHUMAN', title: 'POSTHUMAN' },
  { value: 'Bro_n_Bro', title: 'Bro_n_Bro' },
  { value: 'Imperator', title: 'Imperator' },
  { value: '01node', title: '01node' },
  { value: 'Stakeflow', title: 'Stakeflow' },
  { value: 'PUPMØS', title: 'PUPMØS' },
  { value: 'Citadel.one', title: 'Citadel.one' },
];

const ComparisonTable: FC<OwnProps> = ({ validator }) => {
  const t = useTranslations('ComparisonPage');
  const [data, setData] = useState<ValidatorData[]>([]);
  const [filledData, setFilledData] = useState<ValidatorDataFilled[]>([]);
  const [isChart, setIsChart] = useState<boolean>(false);
  const [chartType, setChartType] = useState<string | undefined>('Daily');
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [moniker, setMoniker] = useState<string>('Citizen Web 3');

  useEffect(() => {
    if (validator) {
      setMoniker(validator.moniker);
    }
    const initial = [getValidatorData(0, moniker), getValidatorData(1, validatorList[0].title)];
    setData(initial);
  }, [validator, moniker]);

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
    setData([getValidatorData(0, moniker)]);
    setChartType('Daily');
    setIsChanged(false);
    setIsComparing(false);
  };

  const handleTypeChange = (name: ChartTypeName) => {
    setIsChanged(true);
    setChartType(name);
  };

  return (
    <>
      <div className="mt-4 flex flex-grow flex-row gap-6 text-base">
        <div className="flex flex-grow flex-col">
          <div className="flex flex-row items-center gap-2 font-handjet">
            {chartTypeNames.map((name) => (
              <button
                key={name}
                type="button"
                aria-label={`Switch to ${name} view`}
                onClick={() => handleTypeChange(name)}
                className={cn(
                  'min-w-9 p-px',
                  chartType === name
                    ? 'border border-[#3e3e3e] text-highlight shadow-button'
                    : 'hover:text-highlight',
                )}
              >
                <div className="flex items-center justify-center px-2 py-0 text-base leading-6 hover:text-highlight">
                  {t(name)}
                </div>
              </button>
            ))}
          </div>
          <div className="flex flex-row self-start border-r border-t border-bgSt bg-table_row shadow-menu-button-rest">
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
          </div>
        </div>
        {filledData.length > 1 && (
          <div className="flex w-80 flex-col items-stretch gap-3 text-lg">
            <ComparisonPanel
              validator={filledData[0]?.moniker}
              isComparing={isComparing}
              onCompare={() => setIsComparing(!isComparing)}
            />
            {isComparing && (
              <RoundedButton contentClassName="px-10 text-lg">{t('Share result')}</RoundedButton>
            )}
            {isChanged && (
              <RoundedButton contentClassName="px-10 text-lg" onClick={handleReset}>
                {t('Reset')}
              </RoundedButton>
            )}
            {filledData.length > 0 && (
              <RoundedButton contentClassName="px-10 text-lg" onClick={() => setIsChart(!isChart)}>
                {t(isChart ? 'Hide Charts' : 'Show Charts')}
              </RoundedButton>
            )}
            {filledData.length > 0 && (
              <div className="mt-2 flex flex-col items-center justify-center">
                <SpreadModal />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ComparisonTable;
