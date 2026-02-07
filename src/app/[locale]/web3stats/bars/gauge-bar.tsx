'use client';

import { FC, useEffect, useState } from 'react';

import CustomBar from '@/components/customSVG/infoBar';

interface GaugeBarProps {
  value: number;
  label: string;
}

const GaugeBar: FC<GaugeBarProps> = ({ value, label }) => {
  const [animatedValue, setAnimatedValue] = useState(value);

  useEffect(() => {
    const overshootValue = Math.min(value + 10, 100);

    const overshootTimer = setTimeout(() => {
      setAnimatedValue(overshootValue);
    }, 300);

    const returnTimer = setTimeout(() => {
      setAnimatedValue(value);
    }, 1000);

    return () => {
      clearTimeout(overshootTimer);
      clearTimeout(returnTimer);
    };
  }, [value]);

  return (
    <div className="group flex cursor-pointer flex-col items-center justify-center space-y-6 text-lg">
      <div className="w-82 transition-transform duration-150 group-active:translate-y-1 group-active:scale-[0.97]">
        <CustomBar value={animatedValue} />
      </div>
      <div>{label}</div>
    </div>
  );
};

export default GaugeBar;
