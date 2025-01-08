'use client';

import { useTranslations } from 'next-intl';
import { FC } from 'react';

import Button from '@/components/common/button';
import EcosystemDropdown from '@/components/common/list-filters/ecosystem-dropdown';

interface OwnProps {
  isChart: boolean;
  chartType: string | undefined;
  onChartChanged: (isChart: boolean) => void;
  onTypeChanged: (name: string) => void;
  onlyDays?: boolean;
  ecosystems?: boolean;
}

const buttons = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const ChartButtons: FC<OwnProps> = ({
  isChart,
  onChartChanged,
  chartType,
  onTypeChanged,
  onlyDays = false,
  ecosystems = false,
}) => {
  const t = useTranslations('ComparisonPage');
  return (
    <div className="flex space-x-4">
      {ecosystems && <EcosystemDropdown selectedEcosystems={[]} onChainsChanged={() => {}} />}
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
