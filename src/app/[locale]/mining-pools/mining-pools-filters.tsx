'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback } from 'react';

import ValidatorListFiltersPorPage from '@/components/common/list-filters/validator-list-filters-perpage';

interface OwnProps {
  perPage: number;
}

const MiningPoolsFilters: FC<OwnProps> = ({ perPage }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePerPageChanged = useCallback(
    (pp: number) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('pp', pp.toString());
      params.set('p', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="mt-10 flex items-center gap-4">
      <ValidatorListFiltersPorPage onChange={handlePerPageChanged} value={perPage} />
    </div>
  );
};

export default MiningPoolsFilters;
