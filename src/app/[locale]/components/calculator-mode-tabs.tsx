'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useTransition } from 'react';

import Switch from '@/components/common/switch';
import { cn } from '@/utils/cn';

interface OwnProps {
  activeMode: 'mining' | 'staking';
  ariaLabel: string;
  miningLabel: string;
  stakingLabel: string;
}

const CalculatorModeTabs: FC<OwnProps> = ({ activeMode, ariaLabel, miningLabel, stakingLabel }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const isMiningMode = activeMode === 'mining';

  const handleModeToggle = (isMining: boolean) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (isMining) {
        params.set('mode', 'mining');
        params.set('network', 'monero');
      } else {
        params.delete('mode');
        params.delete('network');
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <nav aria-label={ariaLabel} className={cn('my-6 flex items-center justify-end', isPending && 'opacity-70')}>
      <span className={cn('font-handjet text-lg', isMiningMode ? 'text-primary' : 'text-highlight')}>
        {stakingLabel}
      </span>
      <Switch value={isMiningMode} onChange={handleModeToggle} />
      <span className={cn('font-handjet text-lg', isMiningMode ? 'text-highlight' : 'text-primary')}>
        {miningLabel}
      </span>
    </nav>
  );
};

export default CalculatorModeTabs;
