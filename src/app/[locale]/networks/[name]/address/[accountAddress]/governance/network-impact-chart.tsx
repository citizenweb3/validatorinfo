'use client';

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useState } from 'react';
import { Doughnut as RDoughnut } from 'react-chartjs-2';

import { externalTooltipHandler } from '@/components/charts/tooltips/externalTooltipHandler';

const config = require('../../../../../../../../tailwind.config.ts');

ChartJS.register(ArcElement, Tooltip, Legend);

const NetworkImpactChart = () => {
  const [data] = useState({
    labels: ['YES Votes', 'NO Votes', 'ABSTAIN', 'VETO'],
    datasets: [
      {
        label: 'Vote Distribution',
        data: [45, 25, 20, 10],
        backgroundColor: [
          config.default.theme.colors.oldPalette.green,
          config.default.theme.colors.oldPalette.red,
          config.default.theme.colors.oldPalette.yellow,
          '#6B7280',
        ],
        borderWidth: 0,
      },
    ],
  });

  const options = {
    responsive: true,
    plugins: {
      id: 'networkImpact',
      legend: {
        display: true,
        position: 'right' as const,
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
    <div className="charts-width">
      {/* @ts-ignore */}
      <RDoughnut data={data} options={options} />
    </div>
  );
};

export default NetworkImpactChart;
