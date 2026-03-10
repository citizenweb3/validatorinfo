'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';
import BaseModalMobile from '@/components/common/modal/base-modal-mobile';
import PlusButton from '@/components/common/plus-button';
import { ecosystemsDropdown } from '@/components/common/list-filters/list-filters';

interface OwnProps {
  selectedEcosystems: string[];
  commissionMin: number;
  commissionMax: number;
  uptimeMin: number;
  activeOnly: boolean;
}

const ValidatorFilterPanel: FC<OwnProps> = ({
  selectedEcosystems,
  commissionMin,
  commissionMax,
  uptimeMin,
  activeOnly,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('ValidatorsPage.Filters');

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(mobileRef, () => setIsMobileOpen(false));

  const updateParam = useCallback(
    (key: string, value: string | string[] | null) => {
      const newSp = new URLSearchParams(searchParams.toString());
      newSp.delete(key);
      newSp.set('p', '1');
      if (value === null) {
        // removed
      } else if (Array.isArray(value)) {
        value.forEach((v) => newSp.append(key, v));
      } else {
        newSp.set(key, value);
      }
      router.push(`${pathname}?${newSp.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleEcosystemToggle = useCallback(
    (eco: string) => {
      const updated = selectedEcosystems.includes(eco)
        ? selectedEcosystems.filter((e) => e !== eco)
        : [...selectedEcosystems, eco];
      updateParam('ecosystems', updated.length > 0 ? updated : null);
    },
    [selectedEcosystems, updateParam],
  );

  const handleCommissionMinChange = useCallback(
    (value: number) => {
      updateParam('commMin', value > 0 ? value.toString() : null);
    },
    [updateParam],
  );

  const handleCommissionMaxChange = useCallback(
    (value: number) => {
      updateParam('commMax', value < 100 ? value.toString() : null);
    },
    [updateParam],
  );

  const handleUptimeMinChange = useCallback(
    (value: number) => {
      updateParam('uptimeMin', value > 0 ? value.toString() : null);
    },
    [updateParam],
  );

  const handleActiveOnlyToggle = useCallback(() => {
    updateParam('activeOnly', activeOnly ? null : 'true');
  }, [activeOnly, updateParam]);

  const hasActiveFilters =
    selectedEcosystems.length > 0 || commissionMin > 0 || commissionMax < 100 || uptimeMin > 0 || activeOnly;

  const filterContent = (
    <div className="flex flex-col gap-4 p-3">
      <div>
        <h4 className="mb-2 font-handjet text-sm text-highlight">{t('ecosystems')}</h4>
        <div className="flex flex-wrap gap-1.5">
          {ecosystemsDropdown.map((eco) => (
            <Button
              key={eco.value}
              onClick={() => handleEcosystemToggle(eco.value)}
              isActive={selectedEcosystems.includes(eco.value)}
              activeType="switcher"
              className="text-xs"
              contentClassName="px-2 py-0.5"
            >
              {eco.title}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-handjet text-sm text-highlight">{t('commission')}</h4>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={commissionMin}
            onChange={(e) => handleCommissionMinChange(parseInt(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded bg-primary accent-highlight"
            aria-label={t('commissionMin')}
          />
          <span className="min-w-[3ch] font-handjet text-xs text-highlight">{commissionMin}%</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={commissionMax}
            onChange={(e) => handleCommissionMaxChange(parseInt(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded bg-primary accent-highlight"
            aria-label={t('commissionMax')}
          />
          <span className="min-w-[3ch] font-handjet text-xs text-highlight">{commissionMax}%</span>
        </div>
      </div>

      <div>
        <h4 className="mb-2 font-handjet text-sm text-highlight">{t('uptimeMin')}</h4>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={100}
            value={uptimeMin}
            onChange={(e) => handleUptimeMinChange(parseInt(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded bg-primary accent-highlight"
            aria-label={t('uptimeMin')}
          />
          <span className="min-w-[3ch] font-handjet text-xs text-highlight">{uptimeMin}%</span>
        </div>
      </div>

      <div>
        <Button
          onClick={handleActiveOnlyToggle}
          isActive={activeOnly}
          activeType="switcher"
          className="text-xs"
          contentClassName="px-2 py-0.5"
        >
          {t('activeOnly')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop filter sidebar */}
      <div className="hidden sm:block">
        {hasActiveFilters && (
          <div className="mb-2 rounded border border-bgSt bg-table_row shadow-md">{filterContent}</div>
        )}
      </div>

      {/* Mobile filter trigger + bottom sheet */}
      <div className="block sm:hidden" ref={mobileRef}>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-highlight shadow-button"
          aria-label={t('openFilters')}
          tabIndex={0}
        >
          <PlusButton size="sm" isOpened={isMobileOpen} />
        </button>
        <BaseModalMobile
          opened={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-xl"
        >
          {filterContent}
        </BaseModalMobile>
      </div>
    </>
  );
};

export default ValidatorFilterPanel;
