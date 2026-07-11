'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { type FC, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { chartAreaBackgroundPlugin } from '@/components/chart/chart-area-background-plugin';
import type { MoneroPoolShareSeries } from '@/services/monero-service';
import { cn } from '@/utils/cn';
import {
  aggregatePoolShareSeries,
  getUniquePoolShareDates,
  type PoolSharePeriod,
} from '@/utils/monero-pool-share';

import type { PoolDominancePeriodOption } from './pool-dominance-section';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  zoomPlugin,
  chartAreaBackgroundPlugin,
);

const MIN_AGGREGATED_POINTS = 3;
const UNKNOWN_POOL_SLUG = 'unknown';
const UNKNOWN_POOL_COLOR = '#6B7280';
const SERIES_COLORS = [
  '#4FB848',
  '#2077E0',
  '#F59E0B',
  '#A855F7',
  '#EC4899',
  '#06B6D4',
  '#EF4444',
  '#84CC16',
  '#F97316',
];

interface OwnProps {
  initialSeries: MoneroPoolShareSeries[];
  locale: string;
  emptyMessage: string;
  periodOptions: PoolDominancePeriodOption[];
}

const formatDate = (dateString: string, period: PoolSharePeriod, locale: string): string => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  if (period === 'year') {
    return date.toLocaleDateString(locale, { year: 'numeric', timeZone: 'UTC' });
  }
  if (period === 'month') {
    return date.toLocaleDateString(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' });
  }
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' });
};

const formatTooltipDate = (dateString: string, locale: string): string =>
  new Date(`${dateString}T00:00:00.000Z`).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

const PoolDominanceChart: FC<OwnProps> = ({ initialSeries, locale, emptyMessage, periodOptions }) => {
  const [period, setPeriod] = useState<PoolSharePeriod>('day');
  const chartRef = useRef<ChartJS<'line'>>(null);

  const periodButtons = useMemo(
    () =>
      periodOptions.filter((option) => {
        if (option.value === 'day') return true;

        const aggregatedSeries = aggregatePoolShareSeries(initialSeries, option.value);
        let maxPointCount = 0;
        for (const poolSeries of aggregatedSeries) {
          maxPointCount = Math.max(maxPointCount, poolSeries.points.length);
        }
        return maxPointCount >= MIN_AGGREGATED_POINTS;
      }),
    [initialSeries, periodOptions],
  );

  const displaySeries = useMemo(
    () => aggregatePoolShareSeries(initialSeries, period),
    [initialSeries, period],
  );
  const dates = useMemo(() => getUniquePoolShareDates(displaySeries), [displaySeries]);

  const chartData = useMemo(
    () => ({
      labels: dates.map((date) => formatDate(date, period, locale)),
      datasets: displaySeries.map((poolSeries, index) => {
        const pointsByDate = new Map(poolSeries.points.map((point) => [point.date, point.sharePercent]));
        const color = poolSeries.pool.slug === UNKNOWN_POOL_SLUG
          ? UNKNOWN_POOL_COLOR
          : SERIES_COLORS[index % SERIES_COLORS.length];

        return {
          label: poolSeries.pool.name,
          data: dates.map((date) => pointsByDate.get(date) ?? null),
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 3,
          tension: 0.25,
          spanGaps: false,
          fill: false,
        };
      }),
    }),
    [dates, displaySeries, locale, period],
  );

  const options = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#FFFFFF',
            boxHeight: 8,
            boxWidth: 24,
            font: { family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif', size: 12 },
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#1E1E1E',
          titleColor: '#2077E0',
          bodyColor: '#FFFFFF',
          borderColor: '#444444',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            title: (tooltipItems) => {
              const dataIndex = tooltipItems[0]?.dataIndex;
              if (dataIndex === undefined) return '';
              const date = dates[dataIndex];
              return date ? formatTooltipDate(date, locale) : '';
            },
            label: (context) => {
              const value = context.parsed.y;
              if (value === null) return context.dataset.label ?? '';
              return `${context.dataset.label ?? ''}: ${value.toLocaleString(locale, {
                maximumFractionDigits: 2,
              })}%`;
            },
          },
        },
        zoom: {
          pan: { enabled: true, mode: 'x' },
          zoom: {
            wheel: { enabled: true },
            pinch: { enabled: true },
            mode: 'x',
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: '#3E3E3E' },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { family: 'Handjet, monospace', size: 12 },
            maxRotation: 0,
            minRotation: 0,
            maxTicksLimit: 10,
          },
        },
        y: {
          beginAtZero: true,
          min: 0,
          max: 100,
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          border: { color: '#3E3E3E' },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { family: 'Handjet, monospace', size: 12 },
            callback: (value) => `${Number(value).toLocaleString(locale)}%`,
          },
        },
      },
    }),
    [dates, locale],
  );

  const handlePeriodChange = (nextPeriod: PoolSharePeriod) => {
    setPeriod(nextPeriod);
    chartRef.current?.resetZoom();
  };

  return (
    <div className="w-full rounded bg-table_row px-3 pb-4 pt-3 sm:px-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 font-handjet">
        {periodButtons.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-label={option.ariaLabel}
            aria-pressed={period === option.value}
            className={cn(
              'min-w-9 border border-transparent px-2 py-1 text-base leading-6 transition-colors hover:text-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight',
              period === option.value && 'border-[#3e3e3e] text-highlight shadow-button',
            )}
            onClick={() => handlePeriodChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="h-[400px] w-full">
        {dates.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded border border-[#3E3E3E]">
            <p className="font-sfpro text-base text-white/70">{emptyMessage}</p>
          </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default PoolDominanceChart;
