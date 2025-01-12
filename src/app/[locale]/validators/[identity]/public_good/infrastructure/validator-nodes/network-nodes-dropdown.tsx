'use client';

import { FC } from 'react';

import EcosystemDropdown from '@/components/common/list-filters/ecosystem-dropdown';
import { useTranslations } from 'next-intl';

interface OwnProps {}

const NetworkNodesDropdown: FC<OwnProps> = () => {
  const t = useTranslations('PublicGoodInfrastructurePage.Table.Networks');

  return (
    <div>
        <EcosystemDropdown title={t('name')} selectedEcosystems={[]} onChainsChanged={() => {}} />
    </div>
  );
};

export default NetworkNodesDropdown;
