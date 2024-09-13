'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LineElement,
  LinearScale,
  PluginOptionsByType,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { FC, useState } from 'react';
import { Line as RLine } from 'react-chartjs-2';

import { initialLineData } from './initialData';
import { lineHoverEffect } from './plugins';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
interface LineProps {
  id: number;
  config: ChartOptions<'line'>;
  isActive: boolean;
  onHover: (id: number, isHovered: boolean) => void;
}

const Line: FC<LineProps> = ({ id, config, isActive, onHover }) => {
  const [hoverEffect] = useState(() => lineHoverEffect(id, isActive, onHover));
  return (
    <div>
      <RLine
        data={initialLineData}
        options={{
          ...config,
        }}
        plugins={[hoverEffect]}
      />
    </div>
  );
};

export default Line;
