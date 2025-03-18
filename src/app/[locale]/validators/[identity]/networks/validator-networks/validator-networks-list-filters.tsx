'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import Dropdown from '@/components/common/list-filters/dropdown';
import { ecosystemsDropdown } from '@/components/common/list-filters/list-filters';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  selectedEcosystems?: string[];
  selectedNodeStatus?: string[];
  selectedSetPosition?: string[];
  selectedNetworkStage?: string[];
}

export const stages = [
  { value: 'mainnet', title: 'Mainnet' },
  { value: 'testnet', title: 'Testnet' },
];

export const nodeStatus = [
  { value: 'jailed', title: 'Jailed' },
  { value: 'all', title: 'All' },
];

export const setPositions = [
  { value: 'active_set', title: 'Active Set' },
  { value: 'not_active_set', title: 'Not Active Set' },
];

const ValidatorNetworksListFilters: FC<OwnProps> = ({
  selectedEcosystems = [],
  selectedNodeStatus = [],
  selectedSetPosition = [],
  selectedNetworkStage = [],
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [resetClicks, setResetClicks] = useState<number>(0);
  const t = useTranslations('ValidatorNetworksPage.Table');

  useEffect(() => {
    if (resetClicks >= 3) {
      router.push(`${pathname}`);
      setIsOpened(false);
    }
    const tm = setTimeout(() => {
      setResetClicks(0);
    }, 1000);

    return () => {
      clearTimeout(tm);
    };
  }, [router, resetClicks]);

  const onCustomiseClick = () => {
    setIsOpened(!isOpened);
    setResetClicks(resetClicks + 1);
  };

  const updateQueryParam = (paramName: string, selectedValues: string[]) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete(paramName);
    selectedValues.forEach((value) => newSp.append(paramName, value));
    router.push(`${pathname}?${newSp.toString()}`);
  };
  
  const onEcosystemChanged = (value: string[]) => {
    updateQueryParam('ecosystems', value);
  };
  
  const onNodeStatusChanged = (value: string[]) => {
    updateQueryParam('node_status', value);
  };
  
  const onSetPositionChanged = (value: string[]) => {
    updateQueryParam('set_position', value);
  };
  
  const onNetworkStageChanged = (value: string[]) => {
    updateQueryParam('network_stage', value);
  };
  
  return (
    <div className="flex h-8 items-center justify-end space-x-6">
      {isOpened && (
        <>
          <Dropdown
            filterValues={ecosystemsDropdown}
            title={t('Ecosystems')}
            selectedValue={selectedEcosystems}
            onChanged={onEcosystemChanged}
          />
          <Dropdown
            filterValues={nodeStatus}
            title={t('Node Status')}
            selectedValue={selectedNodeStatus}
            onChanged={onNodeStatusChanged}
          />
          <Dropdown
            filterValues={setPositions}
            title={t('Set Position')}
            selectedValue={selectedSetPosition}
            onChanged={onSetPositionChanged}
          />
          <Dropdown
            filterValues={stages}
            title={t('Network Stage')}
            selectedValue={selectedNetworkStage}
            onChanged={onNetworkStageChanged}
          />
        </>
      )}
      <div className="flex flex-row items-center">
        <Button
          activeType="switcher"
          onClick={onCustomiseClick}
          isActive={isOpened}
          tooltip={t('Click 3 times to reset all filters')}
        >
          <div className="z-20 -my-1 flex flex-row items-center justify-center py-px text-base font-medium">
            <div>{t('Customize')}</div>
            <PlusButton size="sm" isOpened={isOpened} />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default ValidatorNetworksListFilters;
