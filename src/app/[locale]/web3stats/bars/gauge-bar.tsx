import { FC } from 'react';

import CustomBar from '@/components/customSVG/infoBar';

interface GaugeBarProps {
  value: number;
  label: string;
}

const GaugeBar: FC<GaugeBarProps> = ({ value, label }) => {
  return (
    <div className="group flex cursor-pointer flex-col items-center justify-center space-y-6 text-lg">
      <div className="w-82 transition-transform duration-150 group-active:translate-y-1 group-active:scale-[0.97]">
        <CustomBar value={value} />
      </div>
      <div>{label}</div>
    </div>
  );
};

export default GaugeBar;
