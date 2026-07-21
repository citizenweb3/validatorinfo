'use client';

import { usePathname, useRouter } from 'next/navigation';
import { FC, useCallback } from 'react';

import Dropdown from '@/components/common/list-filters/dropdown';

interface OwnProps {
  options: { value: string; title: string }[];
  selected: string;
}

// Single-select network switcher: unlike the multi-select ListFilters networks dropdown, the
// same-opinions table always shows exactly one chain, so picking a network replaces ?network=.
const SameOpinionsNetworkFilter: FC<OwnProps> = ({ options, selected }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleChanged = useCallback(
    (value: string) => {
      const newSp = new URL(location.href).searchParams;
      newSp.set('network', value);
      newSp.set('p', '1');
      router.push(`${pathname}?${newSp.toString()}`);
    },
    [pathname, router],
  );

  const title = options.find((option) => option.value === selected)?.title ?? selected;

  return <Dropdown filterValues={options} title={title} selectedValue={[selected]} onChanged={handleChanged} />;
};

export default SameOpinionsNetworkFilter;
