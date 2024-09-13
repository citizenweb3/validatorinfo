import { ChartOptions } from 'chart.js/dist/types/index';

export const lineMainTable: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
    y: {
      grid: { display: false },
      beginAtZero: true,
      border: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
  },
  elements: {
    point: {
      radius: 0,
    },
  },
};
