'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';

import Button from '@/components/common/button';
import ValidatorListFiltersBattery from '@/components/common/list-filters/validator-list-filters-battery';
import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';
import PlusButton from '@/components/common/plus-button';
import { useOnClickOutside } from 'usehooks-ts';
import BaseModalMobile from '@/components/common/modal/base-modal-mobile';
import { ecosystemsDropdown, nodeStatus, setPositions, stages } from '@/components/common/list-filters/list-filters';
import DropdownMobile from '@/components/common/list-filters/dropdown-mobile';

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

const ListFiltersMobile: FC<OwnProps> = ({
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
  const t = useTranslations('HomePage.Table');

  const [isModalOpened, setIsModalOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(wrapperRef, () => setIsModalOpened(false));

  const onPerPageChanged = (pp: number) => {
    const newSp = new URL(location.href).searchParams;
    newSp.set('pp', pp.toString());
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onChainsChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('ecosystems');
    const chainParam =
      selectedEcosystems.includes(value)
        ? selectedEcosystems.filter((c) => c !== value)
        : [...selectedEcosystems, value];
    newSp.set('p', '1');
    chainParam.forEach((c) => newSp.append('ecosystems', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onNodeStatusChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('node_status');
    const nodeStatusParam =
      selectedNodeStatus.includes(value)
        ? selectedNodeStatus.filter((c) => c !== value)
        : [...selectedNodeStatus, value];
    newSp.set('p', '1');
    nodeStatusParam.forEach((c) => newSp.append('node_status', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onSetPositionChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('set_position');
    const selectedSetPositionParam =
      selectedSetPosition.includes(value)
        ? selectedSetPosition.filter((c) => c !== value)
        : [...selectedSetPosition, value];
    newSp.set('p', '1');
    selectedSetPositionParam.forEach((c) => newSp.append('set_position', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  const onNetworkStageChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('network_stage');
    const networkStageParam =
      selectedNetworkStage.includes(value)
        ? selectedNetworkStage.filter((c) => c !== value)
        : [...selectedNetworkStage, value];
    newSp.set('p', '1');
    networkStageParam.forEach((c) => newSp.append('network_stage', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div ref={wrapperRef} className="relative flex items-center justify-end mt-20 mb-14 sm:mt-12 sm:mb-6">
      <Button
        activeType="switcher"
        onClick={() => setIsModalOpened((p) => !p)}
        isActive={isModalOpened}
      >
        <div className="z-20 -my-1 flex flex-row items-center justify-center py-px text-6xl sm:text-5xl font-medium mx-10">
          <div>{t('Customize')}</div>
          <PlusButton size="lg" isOpened={isModalOpened} />
        </div>
      </Button>
      <BaseModalMobile
        opened={isModalOpened}
        onClose={() => setIsModalOpened(false)}
        isRelative
        className="right-0 top-full mt-2 w-[50vw] rounded-xl"
      >
        <div className="flex max-h-[60vh] flex-col mr-4 mt-14 items-end">
          {isBattery && <ValidatorListFiltersBattery />}
          <ValidatorListFiltersPorPage onChange={onPerPageChanged} value={perPage} />
          {isEcosystems && (
            <DropdownMobile
              filterValues={ecosystemsDropdown}
              title={t('Ecosystems')}
              selectedValue={selectedEcosystems}
              onChanged={onChainsChanged}
            />
          )}
          {isNodeStatus && (
            <DropdownMobile
              filterValues={nodeStatus}
              title={t('Node Status')}
              selectedValue={selectedNodeStatus}
              onChanged={onNodeStatusChanged}
            />
          )}
          {isSetPositions && (
            <DropdownMobile
              filterValues={setPositions}
              title={t('Set Position')}
              selectedValue={selectedSetPosition}
              onChanged={onSetPositionChanged}
            />
          )}
          {isNetworkStage && (
            <DropdownMobile
              filterValues={stages}
              title={t('Network Stage')}
              selectedValue={selectedNetworkStage}
              onChanged={onNetworkStageChanged}
            />
          )}
        </div>
      </BaseModalMobile>
    </div>
  );
};

export default ListFiltersMobile;
