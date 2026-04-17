'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useTransition } from 'react';

import Dropdown from '@/components/common/list-filters/dropdown';
import { ecosystemsDropdown } from '@/components/common/list-filters/list-filters';
import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';
import Switch from '@/components/common/switch';

interface ValidatorsFiltersProps {
  perPage: number;
  selectedEcosystems: string[];
  mode: 'simple' | 'dev';
}

const ValidatorsFilters: FC<ValidatorsFiltersProps> = ({ perPage, selectedEcosystems, mode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('HomePage');
  const tTable = useTranslations('HomePage.Table');
  const [isPending, startTransition] = useTransition();

  const isDevMode = mode === 'dev';

  const handleEcosystemsChanged = (value: string) => {
    const newSp = new URLSearchParams(searchParams.toString());
    newSp.delete('ecosystems');
    const updatedEcosystems =
      selectedEcosystems.indexOf(value) === -1
        ? [...selectedEcosystems, value]
        : selectedEcosystems.filter((c) => c !== value);
    newSp.set('p', '1');
    updatedEcosystems.forEach((c) => newSp.append('ecosystems', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const handlePerPageChanged = (pp: number) => {
    const newSp = new URLSearchParams(searchParams.toString());
    newSp.set('pp', pp.toString());
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const handleModeToggle = (value: boolean) => {
    startTransition(() => {
      const newSp = new URLSearchParams(searchParams.toString());
      if (value) {
        newSp.set('mode', 'dev');
      } else {
        newSp.delete('mode');
      }
      router.replace(`${pathname}?${newSp.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="mt-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Dropdown
          filterValues={ecosystemsDropdown}
          title={tTable('Ecosystems')}
          selectedValue={selectedEcosystems}
          onChanged={handleEcosystemsChanged}
        />
        <ValidatorListFiltersPorPage onChange={handlePerPageChanged} value={perPage} />
      </div>
      <div className="flex items-center" style={{ opacity: isPending ? 0.7 : 1 }}>
        <span className={`font-handjet text-lg ${!isDevMode ? 'text-highlight' : 'text-primary'}`}>
          {t('Game')}
        </span>
        <Switch value={isDevMode} onChange={handleModeToggle} />
        <span className={`font-handjet text-lg ${isDevMode ? 'text-highlight' : 'text-primary'}`}>
          {t('Dev')}
        </span>
      </div>
    </div>
  );
};

export default ValidatorsFilters;
