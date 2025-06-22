'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';

import ArrowsGoBigButton from '@/components/common/arrows-go-big-button';
import icons from '@/components/icons';
import Tooltip from '@/components/common/tooltip';

interface circleValuesTypes {
  circleRadius: number;
  logoSize: number;
  centerLogoSize: number;
}

interface OwnProps {
  centerLogo: string;
  logos: { id: number; logoUrl: string; prettyName: string }[];
}

const NetworksCircle: FC<OwnProps> = ({ centerLogo, logos }) => {
  const [circleValues, setCircleValues] = useState<circleValuesTypes | null>(null);
  const [centerLogoSrc, setCenterLogoSrc] = useState(centerLogo);

  useEffect(() => {
    const queries = [
      { query: '(min-width: 1515px)', values: { circleRadius: 90, logoSize: 50, centerLogoSize: 80 } },
      { query: '(min-width: 1330px)', values: { circleRadius: 72, logoSize: 40, centerLogoSize: 65 } },
      { query: '(min-width: 1140px)', values: { circleRadius: 64, logoSize: 37, centerLogoSize: 57 } },
      { query: '(min-width: 950px)', values: { circleRadius: 57, logoSize: 32, centerLogoSize: 53 } },
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
          src={centerLogoSrc}
          alt="Center Logo"
          width={centerLogoSize}
          height={centerLogoSize}
          className="rounded-full"
          onError={() => setCenterLogoSrc(icons.AvatarIcon)}
        />
      </div>
      <div className="relative h-full w-full">
        {logos.map((chain, index) => {
          const angle = (index / logos.length) * 2 * Math.PI;
          const x = circleRadius * Math.cos(angle) - logoSize / 2;
          const y = circleRadius * Math.sin(angle) - logoSize / 2;
          return (
            <div
              key={chain.id}
              style={{
                top: `calc(50% + ${y}px)`,
                left: `calc(50% + ${x}px)`,
                width: `${logoSize}px`,
                height: `${logoSize}px`,
              }}
              className="absolute flex items-center justify-center"
            >
              <Tooltip tooltip={chain.prettyName} direction="top">
                <Link href={`/networks/${chain.id}/overview`}>
                  <Image
                    src={chain.logoUrl}
                    alt={chain.prettyName}
                    fill
                    className={`rounded-full h-[${logoSize}] object-contain`} />
                </Link>
              </Tooltip>
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
