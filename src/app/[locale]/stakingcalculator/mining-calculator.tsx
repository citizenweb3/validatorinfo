'use client';

import { useTranslations } from 'next-intl';
import { ChangeEvent, FC, useMemo, useState } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import SubTitle from '@/components/common/sub-title';
import BaseTable from '@/components/common/table/base-table';
import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableHeaderCell from '@/components/common/table/base-table-header-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import { Locale } from '@/i18n';
import type { MoneroMiningEconomics } from '@/services/mining-profitability-service';
import { formatDecimal } from '@/utils/format-decimal';
import { formatHashrate } from '@/utils/format-hashrate';
import {
  estimateElectricityCostPerDay,
  estimateHardwarePaybackDays,
  estimateMiningReturn,
} from '@/utils/mining-revenue';

interface OwnProps {
  economics: MoneroMiningEconomics;
  locale: Locale;
}

interface NumericFieldProps {
  id: string;
  label: string;
  min?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix: string;
  value: string;
}

interface ResultRowProps {
  day: string;
  label: string;
  month: string;
  year: string;
}

type HashrateUnit = 'h' | 'kh' | 'mh';

const DAYS_PER_MONTH = 365.25 / 12;
const DAYS_PER_YEAR = 365.25;
const HASHRATE_MULTIPLIERS: Record<HashrateUnit, number> = {
  h: 1,
  kh: 1_000,
  mh: 1_000_000,
};

const inputClassName =
  'min-w-0 flex-1 bg-transparent px-3 py-2 font-handjet text-lg outline-none placeholder:text-oldPalette-white/40';
const cardClassName = 'border-r border-t border-bgSt bg-table_row p-4 shadow-menu-button-rest';
const metricCardClassName = 'mx-0 w-full pb-8 pt-2.5 xs:w-full sm:w-full md:w-full lg:w-full xl:w-full 2xl:w-full';
const metricDataClassName = 'mt-6 px-2 text-center leading-5';

const parsePositive = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseNonNegative = (value: string): number | null => {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

const NumericField: FC<NumericFieldProps> = ({ id, label, min = 0, onChange, placeholder, suffix, value }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label htmlFor={id} className={`${cardClassName} flex flex-col gap-2 font-sfpro text-lg`}>
      <span>{label}</span>
      <span className="flex items-center border-b border-bgSt bg-background">
        <input
          id={id}
          className={inputClassName}
          inputMode="decimal"
          min={min}
          onChange={handleChange}
          placeholder={placeholder}
          step="any"
          type="number"
          value={value}
        />
        <span className="pr-3 opacity-70">{suffix}</span>
      </span>
    </label>
  );
};

const ResultRow: FC<ResultRowProps> = ({ day, label, month, year }) => {
  return (
    <BaseTableRow>
      <th scope="row" className="px-2 py-2 text-left font-sfpro text-base font-normal">
        {label}
      </th>
      <BaseTableCell className="px-2 py-2 text-right text-lg">{day}</BaseTableCell>
      <BaseTableCell className="px-2 py-2 text-right text-lg">{month}</BaseTableCell>
      <BaseTableCell className="px-2 py-2 text-right text-lg">{year}</BaseTableCell>
    </BaseTableRow>
  );
};

const MiningCalculator: FC<OwnProps> = ({ economics, locale }) => {
  const t = useTranslations('MiningCalculatorPage');
  const [hashrate, setHashrate] = useState('1');
  const [hashrateUnit, setHashrateUnit] = useState<HashrateUnit>('kh');
  const [selectedPool, setSelectedPool] = useState('average');
  const [customPoolFee, setCustomPoolFee] = useState('1');
  const [powerWatts, setPowerWatts] = useState('');
  const [electricityPrice, setElectricityPrice] = useState('');
  const [uptimePercent, setUptimePercent] = useState('100');
  const [hardwareCost, setHardwareCost] = useState('');

  const selectedPoolFee = useMemo(() => {
    if (selectedPool === 'average') return economics.weightedPoolFeePercent;
    if (selectedPool === 'solo') return 0;
    if (selectedPool === 'custom') {
      const parsedFee = parseNonNegative(customPoolFee);
      return parsedFee !== null && parsedFee <= 100 ? parsedFee : null;
    }

    return economics.poolFees.find((pool) => pool.slug === selectedPool)?.feePercent ?? null;
  }, [customPoolFee, economics.poolFees, economics.weightedPoolFeePercent, selectedPool]);

  const calculation = useMemo(() => {
    const hashrateValue = parsePositive(hashrate);
    const uptimeValue = parsePositive(uptimePercent);
    if (hashrateValue === null || uptimeValue === null || uptimeValue > 100 || selectedPoolFee === null) return null;

    return estimateMiningReturn({
      averageReward: economics.averageReward,
      blockTimeSeconds: economics.blockTimeSeconds,
      minerHashrateHps: hashrateValue * HASHRATE_MULTIPLIERS[hashrateUnit],
      networkHashrateHps: economics.networkHashrateHps,
      poolFeePercent: selectedPoolFee,
      tokenPriceUsd: economics.tokenPriceUsd,
      uptimeRatio: uptimeValue / 100,
    });
  }, [economics, hashrate, hashrateUnit, selectedPoolFee, uptimePercent]);

  const electricityCostPerDay = useMemo(() => {
    const powerValue = parsePositive(powerWatts);
    const electricityValue = parseNonNegative(electricityPrice);
    const uptimeValue = parsePositive(uptimePercent);
    if (powerValue === null || electricityValue === null || uptimeValue === null || uptimeValue > 100) return null;
    return estimateElectricityCostPerDay(powerValue, electricityValue, uptimeValue / 100);
  }, [electricityPrice, powerWatts, uptimePercent]);

  const netProfitPerDay =
    calculation && electricityCostPerDay !== null ? calculation.netUsdPerDay - electricityCostPerDay : null;
  const hardwareCostValue = parsePositive(hardwareCost);
  const paybackDays =
    hardwareCostValue !== null && netProfitPerDay !== null
      ? estimateHardwarePaybackDays(hardwareCostValue, netProfitPerDay)
      : null;

  const usdFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const formatUsd = (value: number): string => usdFormatter.format(value);
  const formatToken = (value: number): string => `${formatDecimal(value, locale)} ${economics.tokenSymbol}`;
  const unavailable = t('notIncluded');

  const handleHashrateUnitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setHashrateUnit(event.target.value as HashrateUnit);
  };
  const handlePoolChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPool(event.target.value);
  };

  return (
    <div className="mx-auto mb-24 mt-4 flex w-full max-w-5xl flex-col gap-8">
      <section aria-label={t('inputsTitle')} className="mx-auto w-full max-w-3xl">
        <SubTitle text={t('inputsTitle')} />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={`${cardClassName} flex flex-col gap-2 font-sfpro text-lg`}>
            <label htmlFor="miner-hashrate">{t('hashrate')}</label>
            <div className="flex border-b border-bgSt bg-background">
              <input
                id="miner-hashrate"
                className={inputClassName}
                inputMode="decimal"
                min={0}
                onChange={(event) => setHashrate(event.target.value)}
                step="any"
                type="number"
                value={hashrate}
              />
              <label htmlFor="hashrate-unit" className="sr-only">
                {t('hashrateUnit')}
              </label>
              <select
                id="hashrate-unit"
                aria-label={t('hashrateUnit')}
                className="border-l border-bgSt bg-card px-3 font-handjet text-lg outline-none"
                onChange={handleHashrateUnitChange}
                value={hashrateUnit}
              >
                <option value="h">H/s</option>
                <option value="kh">kH/s</option>
                <option value="mh">MH/s</option>
              </select>
            </div>
          </div>

          <div className={`${cardClassName} flex flex-col gap-2 font-sfpro text-lg`}>
            <label htmlFor="mining-pool">{t('pool')}</label>
            <select
              id="mining-pool"
              className="border-b border-bgSt bg-background px-3 py-2 font-handjet text-lg outline-none"
              onChange={handlePoolChange}
              value={selectedPool}
            >
              <option value="average">
                {t('averageKnownPools', { fee: economics.weightedPoolFeePercent.toFixed(2) })}
              </option>
              {economics.poolFees.map((pool) => (
                <option key={pool.slug} value={pool.slug}>
                  {pool.name} ({pool.feePercent.toFixed(2)}%)
                </option>
              ))}
              <option value="solo">{t('soloMining')}</option>
              <option value="custom">{t('customFee')}</option>
            </select>
          </div>

          {selectedPool === 'custom' && (
            <NumericField
              id="custom-pool-fee"
              label={t('customPoolFee')}
              onChange={setCustomPoolFee}
              suffix="%"
              value={customPoolFee}
            />
          )}

          <NumericField
            id="power-watts"
            label={t('powerConsumption')}
            onChange={setPowerWatts}
            placeholder={t('optional')}
            suffix="W"
            value={powerWatts}
          />
          <NumericField
            id="electricity-price"
            label={t('electricityPrice')}
            onChange={setElectricityPrice}
            placeholder={t('optional')}
            suffix="USD/kWh"
            value={electricityPrice}
          />
          <NumericField id="uptime" label={t('uptime')} onChange={setUptimePercent} suffix="%" value={uptimePercent} />
          <NumericField
            id="hardware-cost"
            label={t('hardwareCost')}
            onChange={setHardwareCost}
            placeholder={t('optional')}
            suffix="USD"
            value={hardwareCost}
          />
        </div>
        <p className="mt-4 font-sfpro text-sm opacity-75">{t('inputNote')}</p>
      </section>

      <section aria-label={t('networkDataTitle')}>
        <SubTitle text={t('networkDataTitle')} />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricsCardItem
            title={t('networkHashrate')}
            data={formatHashrate(economics.networkHashrateHps)}
            className={metricCardClassName}
            dataClassName={metricDataClassName}
          />
          <MetricsCardItem
            title={t('averageReward')}
            data={formatToken(economics.averageReward)}
            className={metricCardClassName}
            dataClassName={metricDataClassName}
          />
          <MetricsCardItem
            title={t('xmrPrice')}
            data={formatUsd(economics.tokenPriceUsd)}
            className={metricCardClassName}
            dataClassName={metricDataClassName}
          />
          <MetricsCardItem
            title={t('selectedPoolFee')}
            data={selectedPoolFee === null ? '—' : `${selectedPoolFee.toFixed(2)}%`}
            className={metricCardClassName}
            dataClassName={metricDataClassName}
          />
        </div>
      </section>

      <section aria-label={t('resultsTitle')} aria-live="polite">
        <SubTitle text={t('resultsTitle')} />
        {!calculation ? (
          <p className={`${cardClassName} mt-6 font-sfpro text-base`}>{t('invalidInputs')}</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <BaseTable className="min-w-[640px]">
              <thead>
                <tr>
                  <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('result')}</BaseTableHeaderCell>
                  <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('perDay')}</BaseTableHeaderCell>
                  <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('perMonth')}</BaseTableHeaderCell>
                  <BaseTableHeaderCell className="px-2 py-2 text-sm">{t('perYear')}</BaseTableHeaderCell>
                </tr>
              </thead>
              <tbody>
                <ResultRow
                  label={t('expectedPayout')}
                  day={formatToken(calculation.netTokenPerDay)}
                  month={formatToken(calculation.netTokenPerDay * DAYS_PER_MONTH)}
                  year={formatToken(calculation.netTokenPerDay * DAYS_PER_YEAR)}
                />
                <ResultRow
                  label={t('returnAfterPoolFee')}
                  day={formatUsd(calculation.netUsdPerDay)}
                  month={formatUsd(calculation.netUsdPerDay * DAYS_PER_MONTH)}
                  year={formatUsd(calculation.netUsdPerDay * DAYS_PER_YEAR)}
                />
                <ResultRow
                  label={t('poolFeeCost')}
                  day={formatUsd(calculation.poolFeeUsdPerDay)}
                  month={formatUsd(calculation.poolFeeUsdPerDay * DAYS_PER_MONTH)}
                  year={formatUsd(calculation.poolFeeUsdPerDay * DAYS_PER_YEAR)}
                />
                <ResultRow
                  label={t('electricityCost')}
                  day={electricityCostPerDay === null ? unavailable : formatUsd(electricityCostPerDay)}
                  month={
                    electricityCostPerDay === null ? unavailable : formatUsd(electricityCostPerDay * DAYS_PER_MONTH)
                  }
                  year={electricityCostPerDay === null ? unavailable : formatUsd(electricityCostPerDay * DAYS_PER_YEAR)}
                />
                <ResultRow
                  label={t('netProfit')}
                  day={netProfitPerDay === null ? unavailable : formatUsd(netProfitPerDay)}
                  month={netProfitPerDay === null ? unavailable : formatUsd(netProfitPerDay * DAYS_PER_MONTH)}
                  year={netProfitPerDay === null ? unavailable : formatUsd(netProfitPerDay * DAYS_PER_YEAR)}
                />
              </tbody>
            </BaseTable>
          </div>
        )}

        {hardwareCostValue !== null && (
          <p className={`${cardClassName} mt-4 font-sfpro text-base`}>
            {paybackDays !== null
              ? t('estimatedPayback', { days: Math.ceil(paybackDays).toLocaleString(locale) })
              : t('paybackUnavailable')}
          </p>
        )}
        <p className="mt-4 font-sfpro text-sm opacity-75">{t('resultDisclaimer')}</p>
      </section>
    </div>
  );
};

export default MiningCalculator;
