'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';
import UnderDevelopment from '@/components/common/under-development';

const TransactionVolumeChart: FC = () => {
  const t = useTranslations('NetworkStatistics');
  const [isChart, setIsChart] = useState<boolean>(true);
  const [chartType, setChartType] = useState<string | undefined>('Daily');

  const handleChartChanged = (value: boolean) => {
    setIsChart(value);
    if (!value) {
      setChartType(undefined);
    } else {
      setChartType('Daily');
    }
  };

  return (
    <div className="mt-6 mb-14">
      <UnderDevelopment title={t('chart unavailable')} size="md" className="mx-20 mt-3" />
    </div>
  );
};

export default TransactionVolumeChart;
