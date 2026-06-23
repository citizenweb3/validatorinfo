'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useCallback } from 'react';

import { cn } from '@/utils/cn';

import type { HashrateWindow } from '@/services/monero-service';

interface WindowOption {
  value: HashrateWindow;
  label: string;
}

interface OwnProps {
  current: HashrateWindow;
  options: WindowOption[];
}

const HashrateWindowSelector: FC<OwnProps> = ({ current, options }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = useCallback(
    (value: HashrateWindow) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('window', value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, value: HashrateWindow) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleSelect(value);
      }
    },
    [handleSelect],
  );

  return (
    <div className="flex flex-row items-center gap-2 font-handjet" role="radiogroup" aria-label="Window">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={current === option.value}
          tabIndex={0}
          onClick={() => handleSelect(option.value)}
          onKeyDown={(event) => handleKeyDown(event, option.value)}
          className={cn(
            'min-w-9 cursor-pointer p-px',
            current === option.value
              ? 'border border-[#3e3e3e] text-highlight shadow-button'
              : 'hover:text-highlight',
          )}
        >
          <div className="flex items-center justify-center px-2 py-0 text-base leading-6">{option.label}</div>
        </button>
      ))}
    </div>
  );
};

export default HashrateWindowSelector;
