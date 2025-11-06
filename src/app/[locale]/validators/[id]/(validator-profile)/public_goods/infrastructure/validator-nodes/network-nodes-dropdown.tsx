'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

import Dropdown from '@/components/common/list-filters/dropdown';
import { ecosystemsDropdown } from '@/components/common/list-filters/list-filters';

const NetworkNodesDropdown = () => {
  const t = useTranslations('PublicGoodsInfrastructurePage.Table.Networks');
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentEcosystems = searchParams.get('ecosystems')?.split(',').filter(Boolean) || [];

  const handleEcosystemChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    let newEcosystems = [...currentEcosystems];
    const index = newEcosystems.indexOf(value);

    if (index > -1) {
      newEcosystems.splice(index, 1);
    } else {
      newEcosystems.push(value);
    }

    if (newEcosystems.length > 0) {
      params.set('ecosystems', newEcosystems.join(','));
    } else {
      params.delete('ecosystems');
    }
    params.set('p', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <Dropdown
        filterValues={ecosystemsDropdown}
        title={t('name')}
        selectedValue={currentEcosystems}
        onChanged={handleEcosystemChange}
      />
    </div>
  );
};

export default NetworkNodesDropdown;
