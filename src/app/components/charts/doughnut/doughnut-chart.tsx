'use client';

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useState } from 'react';
import { Doughnut as RDoughnut } from 'react-chartjs-2';

import { externalTooltipHandler } from '../tooltips/externalTooltipHandler';

const config = require('../../../../../tailwind.config.ts');

ChartJS.register(ArcElement, Tooltip, Legend);

export const initialChartData = {
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

const Doughnut = () => {
  const [data, setData] = useState(initialChartData);

  const options = {
    responsive: true,
    plugins: {
      id: 'doughnut',
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
    <div className="charts-width">
      {/* @ts-ignore */}
      <RDoughnut data={data} options={options} />
    </div>
  );
};

export default Doughnut;
