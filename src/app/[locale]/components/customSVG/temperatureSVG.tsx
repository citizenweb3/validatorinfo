'use client';

import { useEffect, useRef } from 'react';

interface ThermometerProps {
  percent: number;
}

export const Thermometer: React.FC<ThermometerProps> = ({ percent }) => {
  const bulbRef = useRef<SVGRectElement>(null);
  const tubeRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const value = Math.max(0, Math.min(100, percent));
    const maxTotalHeight = 70 + 194;

    let h_bulb, y_bulb, height_bulb;
    let h_tube, y_tube, height_tube;

    const h_total = (value / 100) * maxTotalHeight;

    if (h_total <= 70) {
      h_bulb = h_total;
      y_bulb = 111 - h_bulb;
      height_bulb = h_bulb;
      h_tube = 0;
      y_tube = 42;
      height_tube = 0;
    } else {
      h_bulb = 70;
      y_bulb = 111 - h_bulb;
      height_bulb = h_bulb;
      h_tube = Math.min(h_total - 50, 194);
      y_tube = 42 - h_tube;
      height_tube = h_tube;
    }

    // ✅ Color logic: Red (low), Yellow (medium), Green (high)
    let color = '#FF0000'; // Red
    if (value > 66) {
      color = '#00FF00'; // Green
    } else if (value > 40) {
      color = '#FFFF00'; // Yellow
    }

    if (bulbRef.current && tubeRef.current) {
      bulbRef.current.setAttribute('y', y_bulb.toString());
      bulbRef.current.setAttribute('height', height_bulb.toString());
      bulbRef.current.setAttribute('fill', color);

      tubeRef.current.setAttribute('y', y_tube.toString());
      tubeRef.current.setAttribute('height', height_tube.toString());
      tubeRef.current.setAttribute('fill', color);
    }
  }, [percent]);

  return (
    <div className="absolute inset-0" style={{ transform: 'translateY(-5px)' }}>
      <svg
        className="h-full w-full object-contain"
        viewBox="-22.5 -187.5 195 325"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="circleClip">
            <circle cx="75" cy="75" r="36" />
          </clipPath>
          <clipPath id="tubeClip">
            <path d="M56 42 L56 -313 Q74.25 -333 94.5 -313 L94.5 42 Z" />
          </clipPath>
        </defs>

        {/* UNFILLED BACKGROUND: Translucent */}
        <rect
          x="39"
          y="45"
          width="72"
          height="70"
          fill="#000000"
          opacity="0.3"
          clipPath="url(#circleClip)"
        />
        <rect
          x="63"
          y="-151"
          width="25"
          height="194"
          fill="#000000"
          opacity="0.3"
          clipPath="url(#tubeClip)"
        />
        {/* FILLED structure */}
        <rect
          ref={bulbRef}
          x="39"
          y="115"
          width="72"
          height="0"
          fill="#EB1616"
          clipPath="url(#circleClip)"
        />
        <rect
          ref={tubeRef}
          x="63"
          y="42"
          width="25"
          height="0"
          fill="#EB1616"
          clipPath="url(#tubeClip)"
        />
        {/* outer structure */}
        <circle
          cx="75"
          cy="75"
          r="36"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.75"
          strokeWidth="12"
          strokeDasharray="156 22"
          strokeDashoffset="0"
        />
        <line x1="63" y1="43" x2="63" y2="-150" stroke="#FFFFFF" strokeWidth="8" strokeOpacity="0.75" />
        <line x1="83" y1="43" x2="83" y2="-150" stroke="#FFFFFF" strokeWidth="8" strokeOpacity="0.75" />
        <path d="M63 -147 C68 -160, 78 -160, 83 -147" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeOpacity="0.75" />
      </svg>
    </div>
  );
};