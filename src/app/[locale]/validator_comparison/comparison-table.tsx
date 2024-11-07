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

  useEffect(() => {
    const first = [getValidatorData(0, 'Citizen Web 3')];
    setData(first);
  }, []);

  useEffect(() => {
    setFilledData(fillColors(data));
  }, [data]);

  const handleAdd = (name: string) => {
    setData((state) => [...state, getValidatorData(data.length, name)]);
  };

  const handleChartChanged = (value: boolean) => {
    setIsChart(value);
    if (!value) {
      setChartType(undefined);
    } else {
      setChartType('Daily');
    }
  };

  return (
    <>
      <div className="mt-8 flex items-end justify-between">
        <div>
          <RoundedButton contentClassName="px-20 text-xl">{t('Share result')}</RoundedButton>
        </div>
        <ChartButtons
          isChart={isChart}
          onChartChanged={handleChartChanged}
          chartType={chartType}
          onTypeChanged={(name) => setChartType(name)}
        />
      </div>
      <div className="mt-10 flex flex-grow flex-row text-base">
        <ValidatorLeftPanel />
        {filledData.map((item) => (
          <ValidatorListItem key={item.id} item={item} chartType={chartType} />
        ))}
        {filledData.length < 6 && <ValidatorEmptyItem exists={data.map((v) => v.moniker)} onAdd={handleAdd} />}
      </div>
    </>
  );
};

export default ComparisonTable;
