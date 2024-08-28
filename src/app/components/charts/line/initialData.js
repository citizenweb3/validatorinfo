import { cosmosMonthlyData } from './stub';

const labels = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
];
export const initialLineData = {
  labels: labels,
  datasets: [
    {
      axis: 'y',
      label: 'Cosmos',
      data: cosmosMonthlyData,
      fill: true,
      backgroundColor: [
        ' #4FB848',

      ],
      borderColor: [
        ' #4FB848',
      ],
      borderWidth: 1,
      tension: 0.1,
      pointRadius: 0,
    },
  ],
};
