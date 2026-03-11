import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { EcosystemHealthData } from '@/services/chain-service';
import { cn } from '@/utils/cn';

interface OwnProps {
  ecosystems: EcosystemHealthData[];
  selectedEcosystem?: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

const getHealthStatus = (percentage: number): { color: string; label: 'Healthy' | 'Degraded' | 'Unhealthy' } => {
  if (percentage >= 80) return { color: '#4FB848', label: 'Healthy' };
  if (percentage >= 50) return { color: '#E5C46B', label: 'Degraded' };
  return { color: '#EB1616', label: 'Unhealthy' };
};

const buildCardHref = (
  ecosystem: string,
  selectedEcosystem: string | undefined,
  searchParams: { [key: string]: string | string[] | undefined },
): string => {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'ecosystem' || key === 'ecosystems' || key === 'p') continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  if (selectedEcosystem !== ecosystem) {
    params.set('ecosystem', ecosystem);
    params.append('ecosystems', ecosystem);
  }

  params.set('p', '1');

  const qs = params.toString();
  return qs ? `?${qs}` : '?p=1';
};

const NetworkHealthCards: FC<OwnProps> = async ({ ecosystems, selectedEcosystem, searchParams }) => {
  const t = await getTranslations('NetworkHealth');

  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bgSt">
        {ecosystems.map((eco) => {
          const isSelected = selectedEcosystem === eco.ecosystem;
          const health = getHealthStatus(eco.healthPercentage);
          const href = buildCardHref(eco.ecosystem, selectedEcosystem, searchParams);

          return (
            <Link
              key={eco.ecosystem}
              href={href}
              scroll={false}
              aria-label={`${eco.prettyName} ecosystem: ${eco.activeChains} active chains, ${eco.totalValidators} validators, health status ${t(health.label)}`}
              aria-pressed={isSelected}
              className={cn(
                'flex min-w-[160px] cursor-pointer flex-col gap-1 rounded-sm border bg-card p-3 transition-all duration-200',
                'hover:bg-bgHover hover:shadow-md',
                'sm:min-w-[180px] md:min-w-[200px]',
                isSelected ? 'border-highlight shadow-md' : 'border-transparent',
              )}
            >
              <div className="flex items-center gap-2">
                {eco.logoUrl && (
                  <Image
                    src={eco.logoUrl}
                    alt={eco.prettyName}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                )}
                <span className="truncate font-sfpro text-base text-highlight">{eco.prettyName}</span>
                <span
                  className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: health.color }}
                  aria-hidden="true"
                  title={t(health.label)}
                />
              </div>

              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
                <div className="font-sfpro text-sm text-primary">{t('Active Chains')}</div>
                <div className="text-right font-handjet text-lg">{eco.activeChains}</div>

                <div className="font-sfpro text-sm text-primary">{t('Avg APR')}</div>
                <div className="text-right font-handjet text-lg">
                  {eco.averageApr !== null ? `${eco.averageApr.toFixed(1)}%` : t('No data')}
                </div>

                <div className="font-sfpro text-sm text-primary">{t('Validators')}</div>
                <div className="text-right font-handjet text-lg">{eco.totalValidators.toLocaleString()}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkHealthCards;
