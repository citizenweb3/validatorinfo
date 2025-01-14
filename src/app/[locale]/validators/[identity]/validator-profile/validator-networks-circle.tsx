'use client';

import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

import ArrowsGoBigButton from '@/components/common/arrows-go-big-button';

interface circleValuesTypes {
  circleRadius: number;
  logoSize: number;
  centerLogoSize: number;
}

interface OwnProps {
  centerLogo: string;
  logos: string[];
}

const NetworksCircle: FC<OwnProps> = ({ centerLogo, logos }) => {
  const [circleValues, setCircleValues] = useState<circleValuesTypes | null>(null);

  useEffect(() => {
    const queries = [
      { query: '(min-width: 1515px)', values: { circleRadius: 90, logoSize: 50, centerLogoSize: 80 } },
      { query: '(min-width: 1330px)', values: { circleRadius: 72, logoSize: 40, centerLogoSize: 65 } },
      { query: '(min-width: 1140px)', values: { circleRadius: 64, logoSize: 37, centerLogoSize: 57 } },
      { query: '(min-width: 935px)', values: { circleRadius: 57, logoSize: 32, centerLogoSize: 53 } },
    ];

    const mediaQueries = queries.map(({ query, values }) => ({
      media: window.matchMedia(query),
      values,
    }));

    const updateValues = () => {
      const matched = mediaQueries.find(({ media }) => media.matches);
      const defaultValues: circleValuesTypes = { circleRadius: 40, logoSize: 25, centerLogoSize: 35 };
      setCircleValues(matched ? matched.values : defaultValues);
    };

    updateValues();

    mediaQueries.forEach(({ media }) => media.addEventListener('change', updateValues));

    return () => {
      mediaQueries.forEach(({ media }) => media.removeEventListener('change', updateValues));
    };
  }, []);

  if (!circleValues) {
    return null;
  }

  const { circleRadius, logoSize, centerLogoSize } = circleValues;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className="absolute z-10 flex items-center justify-center rounded-full"
        style={{
          width: `${centerLogoSize}px`,
          height: `${centerLogoSize}px`,
        }}
      >
        <Image
          src={centerLogo}
          alt="Center Logo"
          width={centerLogoSize}
          height={centerLogoSize}
          className="rounded-full"
        />
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
              <Image
                src={logo}
                alt={`Logo ${index}`}
                width={logoSize * 0.9}
                height={logoSize * 0.9}
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
