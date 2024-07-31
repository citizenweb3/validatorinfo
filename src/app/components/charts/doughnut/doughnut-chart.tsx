'use client';

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { useEffect, useState } from 'react';
import { Doughnut as RDoughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const getColorFromCSS = (variable: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

export const initialChartData = {
  labels: ['Cosmos', 'ETH', 'Polkadot'],
  datasets: [
    {
      label: '# of Votes',
      data: [25, 50, 25],
      backgroundColor: ['#4FB848', '#F3B101', '#EB1616'],
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
          boxWidth: 25,
          boxHeight: 25,
          font: {
            size: 16,
            family: 'Squarified',
          },
        },
      },
    },
    cutout: 200,
  };
  // TODO fix colors
  // useEffect(() => {
  //   const updateColors = () => {
  //     const updatedData = {
  //       ...initialChartData,
  //       datasets: initialChartData.datasets.map((dataset) => ({
  //         ...dataset,
  //         backgroundColor: [
  //           getColorFromCSS('--tw-color-green'),
  //           getColorFromCSS('--tw-color-yellow'),
  //           getColorFromCSS('--tw-color-red'),
  //         ],
  //       })),
  //     };
  //     setData(updatedData);
  //   };

  //   if (typeof window !== 'undefined') {
  //     updateColors();
  //     window.addEventListener('resize', updateColors);
  //   }

  //   return () => {
  //     if (typeof window !== 'undefined') {
  //       window.removeEventListener('resize', updateColors);
  //     }
  //   };
  // }, []);

  return (
    <div className="flex h-1/4 w-1/2">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <RDoughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default Doughnut;
