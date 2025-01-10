'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { FC, useEffect, useState } from 'react';

import Button from '@/components/common/button';
import EcosystemDropdown from '@/components/common/list-filters/ecosystem-dropdown';
import PlusButton from '@/components/common/plus-button';
import NodeStatusDropdown
  from '@/app/validators/[identity]/networks/validator-networks/validator-networks-filters/node-status-dropdown';
import SetPositionDropdown
  from '@/app/validators/[identity]/networks/validator-networks/validator-networks-filters/set-position-dropdown';
import NetworkStageDropdown
  from '@/app/validators/[identity]/networks/validator-networks/validator-networks-filters/network-stage-dropdown';

interface OwnProps {
  selectedEcosystems?: string[];
  selectedNodeStatus?: string[];
  selectedSetPosition?: string[];
  selectedNetworkStage?: string[];
}

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

  const onEcosystemChanged = (value: string) => {
    const newSp = new URL(location.href).searchParams;
    newSp.delete('ecosystems');
    const chainParam =
      selectedEcosystems.indexOf(value) === -1
        ? [...selectedEcosystems, value]
        : selectedEcosystems.filter((c) => c !== value);
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
    networkStageParam.forEach((c) => newSp.append('network_stage', c));
    router.push(`${pathname}?${newSp.toString()}`);
  };

  return (
    <div className="flex h-8 items-center justify-end space-x-6">
      {isOpened && (
        <>
          <EcosystemDropdown title={t('Ecosystems')} selectedEcosystems={selectedEcosystems} onChainsChanged={onEcosystemChanged} />
          <NodeStatusDropdown title={t('Node Status')} selectedNodeStatus={selectedNodeStatus} onNodeStatusChanged={onNodeStatusChanged} />
          <SetPositionDropdown title={t('Set Position')} selectedSetPosition={selectedSetPosition} onSetPositionChanged={onSetPositionChanged} />
          <NetworkStageDropdown title={t('Network Stage')} selectedNetworkStage={selectedNetworkStage} onNetworkStageChanged={onNetworkStageChanged} />
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
