'use client';

import { ArcElement, type ChartData, Chart as ChartJS, type ChartOptions, Legend, Tooltip } from 'chart.js';
import { Doughnut as RDoughnut } from 'react-chartjs-2';

import { cn } from '@/utils/cn';

import { externalTooltipHandler } from '../tooltips/externalTooltipHandler';

const config = require('../../../../../../tailwind.config.ts');

ChartJS.register(ArcElement, Tooltip, Legend);

export const initialChartData: ChartData<'doughnut', number[], string> = {
  labels: ['Cosmos', 'ETH', 'Polkadot'],
  datasets: [
    {
      label: '# of Votes',
      data: [25, 50, 25],
      backgroundColor: [
        config.default.theme.colors.oldPalette.green,
        config.default.theme.colors.oldPalette.yellow,
        config.default.theme.colors.oldPalette.red,
      ],
      borderWidth: 0,
    },
  ],
};

export const doughnutChartColors = {
  green: config.default.theme.colors.oldPalette.green as string,
  red: config.default.theme.colors.oldPalette.red as string,
  yellow: config.default.theme.colors.oldPalette.yellow as string,
  muted: config.default.theme.colors.gameboyBody as string,
};

type DoughnutProps = {
  labels?: string[];
  values?: number[];
  colors?: string[];
  datasetLabel?: string;
  ariaLabel?: string;
  className?: string;
};

const Doughnut = ({ labels, values, colors, datasetLabel, ariaLabel, className }: DoughnutProps) => {
  const data: ChartData<'doughnut', number[], string> =
    labels || values || colors || datasetLabel
      ? {
          labels: labels ?? initialChartData.labels,
          datasets: [
            {
              label: datasetLabel ?? initialChartData.datasets[0]?.label,
              data: values ?? initialChartData.datasets[0]?.data ?? [],
              backgroundColor: colors ?? initialChartData.datasets[0]?.backgroundColor,
              borderWidth: 0,
            },
          ],
        }
      : initialChartData;

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          boxWidth: config.default.theme.extend.charts.doughnut.labels.width,
          boxHeight: config.default.theme.extend.charts.doughnut.labels.height,
          font: {
            size: config.default.theme.fontSize['16'],
            family: 'Squarified',
          },
        },
      },
      tooltip: {
        external: externalTooltipHandler,
        enabled: false,
      },
    },
    cutout: 50,
  };
  return (
    <div className={cn('charts-width', className)}>
      <RDoughnut data={data} options={options} role="img" aria-label={ariaLabel} />
    </div>
  );
};

export default Doughnut;
