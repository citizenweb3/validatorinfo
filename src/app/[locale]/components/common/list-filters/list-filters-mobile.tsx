'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useRef, useState } from 'react';

import Button from '@/components/common/button';
import Dropdown from '@/components/common/list-filters/dropdown';
import ValidatorListFiltersBattery from '@/components/common/list-filters/validator-list-filters-battery';
import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';
import PlusButton from '@/components/common/plus-button';
import BaseModal from '@/components/common/modal/base-modal';
import { useOnClickOutside } from 'usehooks-ts';

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
];

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

  /**
   * Модал теперь является dropdown‑ом, привязанным к кнопке.
   * Делается через относительный контейнер + BaseModal с isRelative.
   */
  const [isModalOpened, setIsModalOpened] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Закрывать при клике вне области фильтров
  useOnClickOutside(wrapperRef, () => setIsModalOpened(false));

  /* ----------------------- handlers ----------------------- */
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
    <div ref={wrapperRef} className="relative flex items-center justify-end mt-20 mb-14">
      <Button
        activeType="switcher"
        onClick={() => setIsModalOpened((p) => !p)}
        isActive={isModalOpened}
      >
        <div className="z-20 -my-1 flex flex-row items-center justify-center py-px text-6xl font-medium mx-10">
          <div>{t('Customize')}</div>
          <PlusButton size="lg" isOpened={isModalOpened} />
        </div>
      </Button>

      <BaseModal
        opened={isModalOpened}
        onClose={() => setIsModalOpened(false)}
        isRelative
        className="right-0 top-full mt-2 w-[50vw] rounded-xl"
      >
        <div className="flex max-h-[60vh] flex-col mr-4 mt-14 items-end">
          {isBattery && <ValidatorListFiltersBattery />}
          <ValidatorListFiltersPorPage onChange={onPerPageChanged} value={perPage} />
          {isEcosystems && (
            <Dropdown
              filterValues={ecosystemsDropdown}
              title={t('Ecosystems')}
              selectedValue={selectedEcosystems}
              onChanged={onChainsChanged}
            />
          )}
        </div>
      </BaseModal>
    </div>
  );
};

export default ListFiltersMobile;
