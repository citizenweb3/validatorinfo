'use client';

import { useTranslations } from 'next-intl';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SimulatorChainData } from '@/actions/simulator';
import ComparisonTable from '@/app/stakingcalculator/simulator/comparison-table';
import NetworkMultiSelect from '@/app/stakingcalculator/simulator/network-multi-select';
import SummaryCards from '@/app/stakingcalculator/simulator/summary-cards';
import Switch from '@/components/common/switch';

const DURATION_OPTIONS = [
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' },
  { value: 365, label: '1 year' },
  { value: 730, label: '2 years' },
];

const MAX_SELECTIONS = 5;

interface OwnProps {
  chains: SimulatorChainData[];
}

const Simulator: FC<OwnProps> = ({ chains }) => {
  const t = useTranslations('StakingSimulator');
  const [stakeInput, setStakeInput] = useState('1000');
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [durationDays, setDurationDays] = useState(365);
  const [selectedChainIds, setSelectedChainIds] = useState<number[]>([]);
  const [isCompounding, setIsCompounding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topChainsByApr = useMemo(() => {
    return [...chains]
      .sort((a, b) => b.apr - a.apr)
      .slice(0, 3)
      .map((c) => c.id);
  }, [chains]);

  useEffect(() => {
    setSelectedChainIds(topChainsByApr);
  }, [topChainsByApr]);

  const handleStakeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setStakeInput(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const parsed = parseFloat(value);
      setStakeAmount(isNaN(parsed) ? 0 : parsed);
    }, 300);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  }, []);

  const selectedChains = useMemo(() => {
    return selectedChainIds
      .map((id) => chains.find((c) => c.id === id))
      .filter(Boolean) as SimulatorChainData[];
  }, [selectedChainIds, chains]);

  const durationLabel = useMemo(() => {
    const opt = DURATION_OPTIONS.find((o) => o.value === durationDays);
    return opt ? t(opt.label) : '';
  }, [durationDays, t]);

  return (
    <div className="mt-4 px-2">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="stake-amount" className="mb-1 block text-base text-highlight">
            {t('Stake Amount')}
          </label>
          <div className="relative">
            <span className="absolute left-2 top-2 font-handjet text-xl text-highlight">$</span>
            <input
              id="stake-amount"
              type="text"
              inputMode="decimal"
              value={stakeInput}
              onChange={handleStakeChange}
              onKeyDown={handleKeyDown}
              className="w-full bg-bgSt py-2 pl-6 pr-2 text-right font-handjet text-lg outline-none focus:outline-none"
              placeholder="1000"
              aria-label={t('Stake Amount')}
            />
          </div>
          {isNaN(parseFloat(stakeInput)) && stakeInput !== '' && (
            <div className="mt-1 text-sm text-red">{t('Invalid amount')}</div>
          )}
        </div>

        <div>
          <label htmlFor="duration-select" className="mb-1 block text-base text-highlight">
            {t('Staking Duration')}
          </label>
          <select
            id="duration-select"
            value={durationDays}
            onChange={(e) => setDurationDays(parseInt(e.target.value))}
            className="w-full cursor-pointer border-b border-bgSt bg-background px-3 py-2 font-handjet text-lg outline-none focus:outline-none"
            aria-label={t('Staking Duration')}
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.label)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <NetworkMultiSelect
            chains={chains}
            selected={selectedChainIds}
            onChange={setSelectedChainIds}
            maxSelections={MAX_SELECTIONS}
          />
        </div>

        <div>
          <span className="mb-1 block text-base text-highlight">{t('Compounding')}</span>
          <div className="flex items-center gap-3 py-2">
            <span className="border-b border-bgSt px-2 font-handjet text-lg">{t('Simple')}</span>
            <Switch value={isCompounding} onChange={setIsCompounding} />
            <span className="border-b border-bgSt px-2 font-handjet text-lg">{t('Compound')}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-sm text-primary">
        {t('Showing projections for')} {selectedChains.length} {t('networks over')} {durationLabel}
        {isCompounding ? ` (${t('compounding')})` : ` (${t('simple')})`}
      </div>

      <SummaryCards
        chains={selectedChains}
        stakeAmount={stakeAmount}
        durationDays={durationDays}
        isCompounding={isCompounding}
      />

      <ComparisonTable
        chains={selectedChains}
        stakeAmount={stakeAmount}
        durationDays={durationDays}
        isCompounding={isCompounding}
      />
    </div>
  );
};

export default Simulator;
