'use client';

import { type FC, type KeyboardEvent, useCallback, useState } from 'react';

import Switch from '@/components/common/switch';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {
  accountValueLabel: string;
  tokenLabel: string;
  usdLabel: string;
  toggleLabel: string;
  tokenValue: string | null;
  usdValue: string | null;
  tooltip: string;
}

const AccountValueClient: FC<OwnProps> = ({
  accountValueLabel,
  tokenLabel,
  usdLabel,
  toggleLabel,
  tokenValue,
  usdValue,
  tooltip,
}) => {
  const [isToken, setIsToken] = useState(true);
  const canShowUsd = usdValue !== null;
  const displayedValue = !canShowUsd || isToken ? tokenValue : usdValue;

  const handleToggle = useCallback((value: boolean) => setIsToken(value), []);
  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setIsToken((value) => !value);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex min-h-6 flex-row justify-end">
        {canShowUsd ? (
          <>
            <div className="border-b border-bgSt px-2 font-handjet text-lg">{usdLabel}</div>
            <div
              role="switch"
              tabIndex={0}
              aria-checked={isToken}
              aria-label={toggleLabel}
              onKeyDown={handleKeyDown}
              className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
            >
              <Switch value={isToken} onChange={handleToggle} />
            </div>
            <div className="border-b border-bgSt px-2 font-handjet text-lg">{tokenLabel}</div>
          </>
        ) : null}
      </div>
      <Tooltip tooltip={tooltip} direction="top">
        <div
          className="mt-2.5 flex items-center justify-between px-4 py-1 shadow-button"
          tabIndex={0}
          aria-label={`${accountValueLabel}: ${displayedValue ?? '—'}. ${tooltip}`}
          aria-live="polite"
        >
          <div className="font-sfpro text-lg">{accountValueLabel}:</div>
          <div className="mx-auto px-20 font-handjet text-xl text-highlight">{displayedValue ?? '—'}</div>
        </div>
      </Tooltip>
    </div>
  );
};

export default AccountValueClient;
