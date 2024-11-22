'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import Button from '@/components/common/button';

interface OwnProps {
  isChart: boolean;
  chartType: string | undefined;
  onChartChanged: (isChart: boolean) => void;
  onTypeChanged: (name: string) => void;
  onlyDays?: boolean;
}

const buttons = ['Daily', 'Weekly', 'Monthly'];

const ChartButtons: FC<OwnProps> = ({ isChart, onChartChanged, chartType, onTypeChanged, onlyDays = false }) => {
  const t = useTranslations('ComparisonPage');
  return (
    <div className="space-x-4">
      {!onlyDays && (
        <Button
          isActive={isChart}
          activeType="switcher"
          contentClassName="py-0 px-2 max-h-6 text-base hover:text-highlight"
          onClick={() => {
            onChartChanged(!isChart);
          }}
        >
          {t('Show Charts')}
        </Button>
      )}
      {buttons.map((name) => (
        <Button
          key={name}
          isActive={chartType === name}
          activeType="switcher"
          contentClassName="py-0 px-2 max-h-6 text-base hover:text-highlight"
          onClick={() => {
            onTypeChanged(name);
          }}
        >
          {t(name as 'Weekly' | 'Monthly' | 'Daily')}
        </Button>
      ))}
    </div>
  );
};

export default ChartButtons;
