'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import Dropdown from '@/components/common/list-filters/dropdown';
import ValidatorListFiltersBattery from '@/components/common/list-filters/validator-list-filters-battery';
import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';
import PlusButton from '@/components/common/plus-button';

interface OwnProps {
  selectedEcosystems?: string[];
  selectedNodeStatus?: string[];
  selectedSetPosition?: string[];
  selectedNetworkStage?: string[];
  perPage: number;
  isBattery?: boolean;
  isEcosystems?: boolean;
  isNodeStatus?: boolean;
  isSetPositions?: boolean;
  isNetworkStage?: boolean;
}

export const stages = [
  { value: 'mainnet', title: 'Mainnet' },
  { value: 'testnet', title: 'Testnet' },
];

export const nodeStatus = [
  { value: 'jailed', title: 'Jailed' },
  { value: 'unjailed', title: 'Unjailed' },
  { value: 'all', title: 'All' },
];

export const setPositions = [
  { value: 'active_set', title: 'Active Set' },
  { value: 'not_active_set', title: 'Not Active Set' },
];

export const ecosystemsDropdown = [
  { value: 'cosmos', title: 'Cosmos' },
  { value: 'namada', title: 'Namada' },
  { value: 'solana', title: 'Solana' },
  { value: 'ethereum', title: 'Ethereum' },
  { value: 'polkadot', title: 'Polkadot' },
];

const ListFilters: FC<OwnProps> = ({
  perPage,
  selectedEcosystems = [],
  selectedNodeStatus = [],
  selectedSetPosition = [],
  selectedNetworkStage = [],
  isBattery = false,
  isEcosystems = false,
  isNodeStatus = false,
  isSetPositions = false,
  isNetworkStage = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [resetClicks, setResetClicks] = useState<number>(0);
  const t = useTranslations('HomePage.Table');

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

  const onPerPageChanged = (pp: number) => {
    const newSp = new URL(location.href).searchParams;
    newSp.set('pp', pp.toString());
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onChainsChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('ecosystems');
    const chainParam =
      selectedEcosystems.indexOf(value) === -1
        ? [...selectedEcosystems, value]
        : selectedEcosystems.filter((c) => c !== value);
    newSp.set('p', '1');
    chainParam.forEach((c) => newSp.append('ecosystems', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onNodeStatusChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('node_status');
    const nodeStatusParam =
      selectedNodeStatus.indexOf(value) === -1
        ? [...selectedNodeStatus, value]
        : selectedNodeStatus.filter((c) => c !== value);
    newSp.set('p', '1');
    nodeStatusParam.forEach((c) => newSp.append('node_status', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onSetPositionChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('set_position');
    const selectedSetPositionParam =
      selectedSetPosition.indexOf(value) === -1
        ? [...selectedSetPosition, value]
        : selectedSetPosition.filter((c) => c !== value);
    newSp.set('p', '1');
    selectedSetPositionParam.forEach((c) => newSp.append('set_position', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onNetworkStageChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('network_stage');
    const networkStageParam =
      selectedNetworkStage.indexOf(value) === -1
        ? [...selectedNetworkStage, value]
        : selectedNetworkStage.filter((c) => c !== value);
    newSp.set('p', '1');
    networkStageParam.forEach((c) => newSp.append('network_stage', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div className="flex h-8 items-center justify-end space-x-10">
      {isOpened && (
        <>
          {isEcosystems && (
            <Dropdown
              filterValues={ecosystemsDropdown}
              title={t('Ecosystems')}
              selectedValue={selectedEcosystems}
              onChanged={onChainsChanged}
            />
          )}
          {isNodeStatus && (
            <Dropdown
              filterValues={nodeStatus}
              title={t('Node Status')}
              selectedValue={selectedNodeStatus}
              onChanged={onNodeStatusChanged}
            />
          )}
          {isSetPositions && (
            <Dropdown
              filterValues={setPositions}
              title={t('Set Position')}
              selectedValue={selectedSetPosition}
              onChanged={onSetPositionChanged}
            />
          )}
          {isNetworkStage && (
            <Dropdown
              filterValues={stages}
              title={t('Network Stage')}
              selectedValue={selectedNetworkStage}
              onChanged={onNetworkStageChanged}
            />
          )}
          <ValidatorListFiltersPorPage onChange={onPerPageChanged} value={perPage} />
          {isBattery && <ValidatorListFiltersBattery />}
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

export default ListFilters;
