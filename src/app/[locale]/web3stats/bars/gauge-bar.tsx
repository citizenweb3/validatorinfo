'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';

import CustomBar from '@/components/customSVG/infoBar';

interface GaugeBarProps {
  value: number;
  label: string;
}

const GaugeBar: FC<GaugeBarProps> = ({ value, label }) => {
  const [animatedValue, setAnimatedValue] = useState(value);
  const isAnimating = useRef(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const triggerAnimation = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const overshootValue = Math.min(value + 10, 100);

    const overshootTimer = setTimeout(() => {
      setAnimatedValue(overshootValue);
    }, 100);

    const returnTimer = setTimeout(() => {
      setAnimatedValue(value);
      isAnimating.current = false;
    }, 700);

    timersRef.current = [overshootTimer, returnTimer];
  }, [value]);

  useEffect(() => {
    triggerAnimation();

    return () => {
      timersRef.current.forEach(clearTimeout);
      isAnimating.current = false;
    };
  }, [triggerAnimation]);

  const handleMouseEnter = () => triggerAnimation();

  return (
    <div
      className="group flex cursor-pointer flex-col items-center justify-center space-y-6 text-lg"
      onMouseEnter={handleMouseEnter}
    >
      <div className="w-82 transition-transform duration-150 group-active:translate-y-1 group-active:scale-[0.97]">
        <CustomBar value={value} pointerValue={animatedValue} />
      </div>
      <div>{label}</div>
    </div>
  );
};

export default GaugeBar;
