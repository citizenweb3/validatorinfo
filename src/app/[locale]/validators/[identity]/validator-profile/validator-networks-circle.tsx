'use client';

import { FC, useEffect, useState } from 'react';

import ArrowsGoBigButton from '@/components/common/arrows-go-big-button';

interface OwnProps {
  centerLogo: string;
  logos: string[];
}

const NetworksCircle: FC<OwnProps> = ({ centerLogo, logos }) => {
  const [responsiveValues, setResponsiveValues] = useState({
    circleRadius: 90,
    logoSize: 50,
    centerLogoSize: 70,
  });

  useEffect(() => {
    const getResponsiveValues = () => {
      if (window.innerWidth >= 1515) {
        return { circleRadius: 90, logoSize: 50, centerLogoSize: 80 };
      } else if (window.innerWidth >= 1330) {
        return { circleRadius: 72, logoSize: 40, centerLogoSize: 65 };
      } else if (window.innerWidth >= 1140) {
        return { circleRadius: 64, logoSize: 37, centerLogoSize: 57 };
      } else if (window.innerWidth >= 768) {
        return { circleRadius: 57, logoSize: 32, centerLogoSize: 53 };
      } else {
        return { circleRadius: 40, logoSize: 20, centerLogoSize: 30 };
      }
    };

    const updateValues = () => {
      setResponsiveValues(getResponsiveValues());
    };

    updateValues();
    window.addEventListener('resize', updateValues);

    return () => {
      window.removeEventListener('resize', updateValues);
    };
  }, []);

  const { circleRadius, logoSize, centerLogoSize } = responsiveValues;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="absolute z-10 flex items-center justify-center rounded-full"
        style={{
          width: `${centerLogoSize}px`,
          height: `${centerLogoSize}px`,
        }}
      >
        <img src={centerLogo} alt="Center Logo" className="h-full w-full rounded-full" />
      </div>
      <div className="relative h-full w-full">
        {logos.map((logo, index) => {
          const angle = (index / logos.length) * 2 * Math.PI;
          const x = circleRadius * Math.cos(angle) - logoSize / 2;
          const y = circleRadius * Math.sin(angle) - logoSize / 2;
          return (
            <div
              key={index}
              style={{
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                width: `${logoSize}px`,
                height: `${logoSize}px`,
              }}
              className="absolute flex items-center justify-center"
            >
              <img
                src={logo}
                alt={`Logo ${index}`}
                style={{
                  width: `${logoSize * 0.9}px`,
                  height: `${logoSize * 0.9}px`,
                }}
                className="rounded-full"
              />
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-0.5 right-1">
        <ArrowsGoBigButton isOpened={false} size="md" />
      </div>
    </div>
  );
};

export default NetworksCircle;
