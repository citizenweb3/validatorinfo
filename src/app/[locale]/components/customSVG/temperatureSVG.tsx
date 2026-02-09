'use client';

import { useCallback, useEffect, useRef } from 'react';

interface ThermometerProps {
  percent: number;
}

const ANIMATION_DURATION = 600;

const calcFill = (value: number) => {
  const clamped = Math.max(0, Math.min(100, value));
  const maxTotalHeight = 70 + 194;
  const h_total = (clamped / 100) * maxTotalHeight;

  let y_bulb: number, height_bulb: number;
  let y_tube: number, height_tube: number;

  if (h_total <= 70) {
    height_bulb = h_total;
    y_bulb = 111 - height_bulb;
    y_tube = 42;
    height_tube = 0;
  } else {
    height_bulb = 70;
    y_bulb = 111 - height_bulb;
    height_tube = Math.min(h_total - 50, 194);
    y_tube = 42 - height_tube;
  }

  let color = '#FF0000';
  if (clamped > 66) {
    color = '#00FF00';
  } else if (clamped > 40) {
    color = '#FFFF00';
  }

  return { y_bulb, height_bulb, y_tube, height_tube, color };
};

const applyFill = (
  bulb: SVGRectElement,
  tube: SVGRectElement,
  fill: ReturnType<typeof calcFill>,
) => {
  bulb.setAttribute('y', fill.y_bulb.toString());
  bulb.setAttribute('height', fill.height_bulb.toString());
  bulb.setAttribute('fill', fill.color);
  tube.setAttribute('y', fill.y_tube.toString());
  tube.setAttribute('height', fill.height_tube.toString());
  tube.setAttribute('fill', fill.color);
};

export const Thermometer: React.FC<ThermometerProps> = ({ percent }) => {
  const bulbRef = useRef<SVGRectElement>(null);
  const tubeRef = useRef<SVGRectElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    if (!bulbRef.current || !tubeRef.current) return;
    applyFill(bulbRef.current, tubeRef.current, calcFill(percent));
  }, [percent]);

  const animateTo = useCallback(
    (from: ReturnType<typeof calcFill>, to: ReturnType<typeof calcFill>, onComplete?: () => void) => {
      const bulb = bulbRef.current;
      const tube = tubeRef.current;
      if (!bulb || !tube) return;

      const start = performance.now();

      const step = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / ANIMATION_DURATION, 1);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        const lerp = (a: number, b: number) => a + (b - a) * ease;

        bulb.setAttribute('y', lerp(from.y_bulb, to.y_bulb).toString());
        bulb.setAttribute('height', lerp(from.height_bulb, to.height_bulb).toString());
        tube.setAttribute('y', lerp(from.y_tube, to.y_tube).toString());
        tube.setAttribute('height', lerp(from.height_tube, to.height_tube).toString());
        bulb.setAttribute('fill', to.color);
        tube.setAttribute('fill', to.color);

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          onComplete?.();
        }
      };

      requestAnimationFrame(step);
    },
    [],
  );

  const handleMouseEnter = useCallback(() => {
    if (animatingRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    animatingRef.current = true;
    const currentBase = calcFill(percent);
    const currentFull = { ...calcFill(100), color: currentBase.color };

    animateTo(currentBase, currentFull, () => {
      timeoutRef.current = setTimeout(() => {
        animateTo(currentFull, currentBase, () => {
          animatingRef.current = false;
        });
      }, 200);
    });
  }, [percent, animateTo]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      className="absolute inset-0"
      style={{ transform: 'translateY(-5px)' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
