'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC, useState } from 'react';

import ChartButtons from '@/app/validator_comparison/chart-buttons';
import SubTitle from '@/components/common/sub-title';

const VanityChartLine: FC = () => {
  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<string | undefined>('Daily');
  const t = useTranslations('ValidatorPassportPage');

  const handleChartChanged = (value: boolean) => {
    setIsChart(value);
    if (!value) {
      setChartType(undefined);
    } else {
      setChartType('Daily');
    }
  };
  return (
    <div>
      <SubTitle text={t('Vanity Chart')} />
      <div className="mt-4 flex items-center justify-center">
        <ChartButtons
          onlyDays
          ecosystems={false}
          isChart={isChart}
          onChartChanged={handleChartChanged}
          chartType={chartType}
          onTypeChanged={(name) => setChartType(name)}
        />
      </div>
      <Image
        src={'/img/charts/vanity-chart.svg'}
        width={700}
        height={300}
        alt="vanity chart"
        className="mt-2 pl-16"
      />
    </div>
  );
};

export default VanityChartLine;
