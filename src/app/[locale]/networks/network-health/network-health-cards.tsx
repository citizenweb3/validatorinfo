'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback } from 'react';

import { EcosystemHealthData } from '@/services/chain-service';
import { cn } from '@/utils/cn';

interface OwnProps {
  ecosystems: EcosystemHealthData[];
  selectedEcosystem?: string;
}

const getHealthStatus = (percentage: number): { color: string; label: 'Healthy' | 'Degraded' | 'Unhealthy' } => {
  if (percentage >= 80) return { color: '#4FB848', label: 'Healthy' };
  if (percentage >= 50) return { color: '#E5C46B', label: 'Degraded' };
  return { color: '#EB1616', label: 'Unhealthy' };
};

const NetworkHealthCards: FC<OwnProps> = ({ ecosystems, selectedEcosystem }) => {
  const t = useTranslations('NetworkHealth');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleCardClick = useCallback(
    (ecosystem: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (selectedEcosystem === ecosystem) {
        params.delete('ecosystem');
        params.delete('ecosystems');
      } else {
        params.set('ecosystem', ecosystem);
        params.delete('ecosystems');
        params.append('ecosystems', ecosystem);
      }
      params.set('p', '1');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [selectedEcosystem, searchParams, router, pathname],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, ecosystem: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(ecosystem);
      }
    },
    [handleCardClick],
  );

  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-bgSt">
        {ecosystems.map((eco) => {
          const isSelected = selectedEcosystem === eco.ecosystem;
          const health = getHealthStatus(eco.healthPercentage);

          return (
            <div
              key={eco.ecosystem}
              role="button"
              tabIndex={0}
              aria-label={`${eco.prettyName} ecosystem: ${eco.activeChains} active chains, ${eco.totalValidators} validators, health status ${t(health.label)}`}
              aria-pressed={isSelected}
              onClick={() => handleCardClick(eco.ecosystem)}
              onKeyDown={(e) => handleKeyDown(e, eco.ecosystem)}
              className={cn(
                'flex min-w-[160px] cursor-pointer flex-col gap-1 rounded-sm border bg-card p-3 transition-all duration-200',
                'hover:bg-bgHover hover:shadow-md',
                'sm:min-w-[180px] md:min-w-[200px]',
                {
                  'border-highlight shadow-md': isSelected,
                  'border-transparent': !isSelected,
                },
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NetworkHealthCards;
