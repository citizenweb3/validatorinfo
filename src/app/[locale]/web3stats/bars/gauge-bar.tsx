'use client';

import { FC, useState } from 'react';

import CustomBar from '@/components/customSVG/infoBar';

interface GaugeBarProps {
  value: number;
  label: string;
}

const GaugeBar: FC<GaugeBarProps> = ({ value, label }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      className="group flex cursor-pointer flex-col items-center justify-center space-y-6 text-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-82 transition-transform duration-150 group-active:translate-y-1 group-active:scale-[0.97]">
        <CustomBar value={isHovered ? 100 : value} />
      </div>
      <div>{label}</div>
    </div>
  );
};

export default GaugeBar;
