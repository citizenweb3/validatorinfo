'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useState } from 'react';
import { Line as RLine } from 'react-chartjs-2';

import { initialLineData } from './initialData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Line = () => {
  const [data] = useState(initialLineData);

  return (
    <div>
      <RLine
        data={data}
        options={{
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
        }}
      />
    </div>
  );
};

export default Line;
