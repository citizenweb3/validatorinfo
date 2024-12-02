'use client';

import { useTranslations } from 'next-intl';
import { FC, useEffect, useState } from 'react';

import ValidatorEmptyItem from '@/app/validator_comparison/ValidatorEmptyItem';
import ChartButtons from '@/app/validator_comparison/chart-buttons';
import getValidatorData, { ValidatorData, ValidatorDataFilled } from '@/app/validator_comparison/get-validator-data';
import { fillColors } from '@/app/validator_comparison/helpers';
import ValidatorLeftPanel from '@/app/validator_comparison/validator-left-panel';
import ValidatorListItem from '@/app/validator_comparison/validator-list-item';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {}

const ComparisonTable: FC<OwnProps> = ({}) => {
  const t = useTranslations('ComparisonPage');
  const [data, setData] = useState<ValidatorData[]>([]);
  const [filledData, setFilledData] = useState<ValidatorDataFilled[]>([]);
  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<string | undefined>('Daily');
  const [isChanged, setIsChanged] = useState<boolean>(false);

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

  const handleRemove = (id: number) => {
    setData((state) => state.filter((v) => v.id !== id));
    setIsChanged(true);
  };

  const handleReset = () => {
    setData([getValidatorData(0, 'Citizen Web 3')]);
    setChartType('Daily');
    setIsChanged(false);
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
        {filledData.map((item) => (
          <ValidatorListItem
            onRemove={() => handleRemove(item.id)}
            key={item.id}
            item={item}
            chartType={chartType}
            isChart={isChart}
          />
        ))}
        {filledData.length < 3 && <ValidatorEmptyItem exists={data.map((v) => v.moniker)} onAdd={handleAdd} />}
        <div className="flex-grow"></div>
        <div className="flex flex-col items-end justify-end space-y-6">
          {isChanged && (
            <RoundedButton contentClassName="px-20 text-lg" onClick={handleReset}>
              {t('Reset')}
            </RoundedButton>
          )}
          {filledData.length > 0 && (
            <RoundedButton contentClassName="px-20 text-lg" onClick={() => setIsChart(!isChart)}>
              {t(isChart ? 'Hide Charts' : 'Show Charts')}
            </RoundedButton>
          )}
          {filledData.length > 1 && (
            <RoundedButton contentClassName="px-20 text-2xl">{t('Share result')}</RoundedButton>
          )}
        </div>
      </div>
    </>
  );
};

export default ComparisonTable;
