'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FC, useCallback, useMemo, useRef, useState } from 'react';

import icons from '@/components/icons';
import { SimulatorChainData } from '@/actions/simulator';
import { cn } from '@/utils/cn';

interface OwnProps {
  chains: SimulatorChainData[];
  selected: number[];
  onChange: (selected: number[]) => void;
  maxSelections: number;
}

const NetworkMultiSelect: FC<OwnProps> = ({ chains, selected, onChange, maxSelections }) => {
  const t = useTranslations('StakingSimulator');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search) return chains;
    const lower = search.toLowerCase();
    return chains.filter((c) => c.prettyName.toLowerCase().includes(lower));
  }, [chains, search]);

  const handleToggle = useCallback(
    (chainId: number) => {
      if (selected.includes(chainId)) {
        onChange(selected.filter((id) => id !== chainId));
      } else if (selected.length < maxSelections) {
        onChange([...selected, chainId]);
      }
    },
    [selected, onChange, maxSelections],
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
      }
    },
    [],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  const selectedChains = useMemo(() => {
    return selected.map((id) => chains.find((c) => c.id === id)).filter(Boolean) as SimulatorChainData[];
  }, [selected, chains]);

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur} onKeyDown={handleKeyDown}>
      <label className="mb-1 block text-base text-highlight" id="network-selector-label">
        {t('Select Networks')}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between border-b border-bgSt bg-background px-3 py-2 text-left font-handjet text-lg hover:text-highlight focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby="network-selector-label"
      >
        <span>
          {selectedChains.length > 0
            ? `${selectedChains.length} ${t('networks selected')}`
            : t('Select Networks')}
        </span>
        <span className={cn('ml-2 transition-transform', isOpen && 'rotate-180')}>&#9660;</span>
      </button>

      {selectedChains.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedChains.map((chain) => (
            <span
              key={chain.id}
              className="flex items-center gap-1 rounded bg-table_header px-2 py-1 font-handjet text-base"
            >
              <Image
                src={chain.logoUrl || icons.AvatarIcon}
                alt={chain.prettyName}
                width={16}
                height={16}
                className="rounded-full"
              />
              {chain.prettyName}
              <button
                type="button"
                onClick={() => handleToggle(chain.id)}
                className="ml-1 text-highlight hover:text-white"
                aria-label={`${t('Remove')} ${chain.prettyName}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto border border-bgSt bg-background shadow-lg"
          role="listbox"
          aria-labelledby="network-selector-label"
          aria-multiselectable="true"
        >
          <div className="sticky top-0 border-b border-bgSt bg-background p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search networks')}
              className="w-full bg-bgSt px-2 py-1 font-handjet text-base outline-none focus:outline-none"
              aria-label={t('Search networks')}
            />
          </div>
          {filtered.map((chain) => {
            const isSelected = selected.includes(chain.id);
            const isDisabled = !isSelected && selected.length >= maxSelections;

            return (
              <button
                key={chain.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isDisabled}
                onClick={() => handleToggle(chain.id)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left font-handjet text-base hover:bg-table_header',
                  isSelected && 'bg-table_header text-highlight',
                  isDisabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <Image
                  src={chain.logoUrl || icons.AvatarIcon}
                  alt={chain.prettyName}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span className="flex-1">{chain.prettyName}</span>
                <span className="font-sfpro text-sm text-highlight">{chain.apr.toFixed(2)}%</span>
                {isSelected && <span className="text-highlight">&#10003;</span>}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-3 py-2 font-handjet text-base text-primary">{t('No networks found')}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkMultiSelect;
