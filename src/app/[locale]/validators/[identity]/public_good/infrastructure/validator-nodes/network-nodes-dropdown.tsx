'use client';

import { FC } from 'react';

import { useTranslations } from 'next-intl';
import Dropdown from '@/components/common/list-filters/dropdown';
import { ecosystemsDropdown } from '@/components/common/list-filters/list-filters';

interface OwnProps {}

const NetworkNodesDropdown: FC<OwnProps> = () => {
  const t = useTranslations('PublicGoodInfrastructurePage.Table.Networks');

  return (
    <div>
        <Dropdown filterValues={ecosystemsDropdown} title={t('name')} selectedValue={[]} onChanged={() => {}} />
    </div>
  );
};

export default NetworkNodesDropdown;
