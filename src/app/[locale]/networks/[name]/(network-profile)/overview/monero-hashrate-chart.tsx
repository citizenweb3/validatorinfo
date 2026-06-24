'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { chartAreaBackgroundPlugin } from '@/components/chart/chart-area-background-plugin';
import { crosshairPlugin } from '@/components/chart/chart-crosshair-plugin';
import { shadowPlugin } from '@/components/chart/chart-shadow-plugin';
import { MoneroHashratePoint } from '@/services/monero-service';
import { cn } from '@/utils/cn';
import { scaleHashrateForChart } from '@/utils/format-hashrate';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin,
  shadowPlugin,
  crosshairPlugin,
  chartAreaBackgroundPlugin,
);

type PeriodType = 'day' | 'week' | 'month' | 'year';

interface OwnProps {
  initialData: MoneroHashratePoint[];
}

const periodMapping: Record<string, PeriodType> = {
  Daily: 'day',
  Weekly: 'week',
  Monthly: 'month',
  Yearly: 'year',
};

const getWeekStart = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

const aggregateByPeriod = (dailyData: MoneroHashratePoint[], period: PeriodType): MoneroHashratePoint[] => {
  if (period === 'day') return dailyData;

  const aggregated = new Map<string, MoneroHashratePoint>();

  dailyData.forEach((point) => {
    const date = new Date(point.date);
    let key: string;
    if (period === 'week') {
      key = getWeekStart(date);
    } else if (period === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = String(date.getFullYear());
    }

    const existing = aggregated.get(key);
    if (!existing || new Date(point.date) > new Date(existing.date)) {
      aggregated.set(key, { date: key, hashrate: point.hashrate });
    }
  });

  return Array.from(aggregated.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const MoneroHashrateChart: FC<OwnProps> = ({ initialData }) => {
  const [period, setPeriod] = useState<PeriodType>('day');
  const [chartType, setChartType] = useState<string>('Daily');
  const chartRef = useRef<ChartJS<'line'>>(null);

  const data = useMemo(() => aggregateByPeriod(initialData, period), [initialData, period]);

  const { scaledData, unit } = useMemo(() => {
    if (data.length === 0) return { scaledData: [] as MoneroHashratePoint[], unit: 'H/s' };
    const maxRaw = Math.max(...data.map((p) => p.hashrate));
    const sample = scaleHashrateForChart(maxRaw);
    const divisor = maxRaw > 0 ? maxRaw / sample.value : 1;
    return {
      scaledData: data.map((p) => ({ date: p.date, hashrate: divisor > 0 ? p.hashrate / divisor : p.hashrate })),
      unit: sample.unit,
    };
  }, [data]);

  // Frame the visible data tightly (not from zero) so small hashrate variation reads as a real
  // curve instead of a flat line — same idea as the tokenomics price chart (beginAtZero: false +
  // padded range). Pad by a share of the visible span; fall back to ±5% when the data is constant.
  const getAdaptiveYRange = useCallback(
    (startIndex: number, endIndex: number): { min: number; max: number } => {
      if (scaledData.length === 0) return { min: 0, max: 10 };
      const visible = scaledData.slice(startIndex, endIndex + 1);
      if (visible.length === 0) return { min: 0, max: 10 };
      const values = visible.map((p) => p.hashrate);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const span = maxValue - minValue;
      if (span <= 0) {
        const pad = maxValue * 0.05 || 1;
        return { min: Math.max(0, maxValue - pad), max: maxValue + pad };
      }
      const pad = span * 0.25;
      return { min: Math.max(0, minValue - pad), max: maxValue + pad };
    },
    [scaledData],
  );

  const updateYAxis = useCallback(
    (chart: ChartJS<'line'>) => {
      const xScale = chart.scales.x;
      if (!xScale) return;

      const minIndex = Math.max(0, Math.floor(xScale.min));
      const maxIndex = Math.min(scaledData.length - 1, Math.ceil(xScale.max));
      const { min: yMin, max: yMax } = getAdaptiveYRange(minIndex, maxIndex);
      const yScale = chart.scales.y;

      if (yScale && (yScale.max !== yMax || yScale.min !== yMin)) {
        yScale.options.min = yMin;
        yScale.options.max = yMax;
        chart.update('none');
      }
    },
    [scaledData.length, getAdaptiveYRange],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    if (period === 'day' || period === 'week') return `${day} ${monthShort}`;
    if (period === 'month') return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return date.getFullYear().toString();
  };

  const initialYRange = useMemo(
    () => getAdaptiveYRange(0, scaledData.length - 1),
    [scaledData, getAdaptiveYRange],
  );

  const chartData = {
    labels: scaledData.map((p) => formatDate(p.date)),
    datasets: [
      {
        label: 'Hashrate',
        data: scaledData.map((p) => p.hashrate),
        borderColor: '#4FB848',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
        fill: false,
        yAxisID: 'y',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#1E1E1E',
        titleColor: '#2077E0',
        bodyColor: '#FFFFFF',
        borderColor: '#444444',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 6,
        usePointStyle: false,
        titleFont: { family: 'Handjet, monospace', size: 14, weight: 400 },
        bodyFont: { family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif', size: 13 },
        callbacks: {
          title: (tooltipItems) => {
            if (tooltipItems.length === 0) return '';
            const index = tooltipItems[0].dataIndex;
            const point = scaledData[index];
            if (!point) return '';
            const date = new Date(point.date);
            return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          },
          label: (context) => {
            const value = context.parsed.y;
            return `  Hashrate    ${value.toFixed(2)} ${unit}`;
          },
          labelColor: (context) => ({
            borderColor: '#FFFFFF',
            backgroundColor: context.dataset.borderColor as string,
            borderWidth: 1,
          }),
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          onPan: ({ chart }) => updateYAxis(chart as ChartJS<'line'>),
          onPanComplete: ({ chart }) => updateYAxis(chart as ChartJS<'line'>),
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
          onZoom: ({ chart }) => updateYAxis(chart as ChartJS<'line'>),
          onZoomComplete: ({ chart }) => updateYAxis(chart as ChartJS<'line'>),
        },
      },
    },
    scales: {
      x: {
        grid: { display: true, drawOnChartArea: false, drawTicks: true, tickLength: 6, tickColor: '#3E3E3E' },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { family: 'Handjet, monospace', size: 12 },
          maxRotation: 0,
          minRotation: 0,
          padding: 4,
          autoSkip: true,
          maxTicksLimit: 10,
          callback: function (value, index) {
            if (index === 0) return '';
            return this.getLabelForValue(value as number);
          },
        },
        border: { color: '#3E3E3E' },
      },
      y: {
        grid: { display: true, drawOnChartArea: false, drawTicks: true, tickLength: 6, tickColor: '#3E3E3E' },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: { family: 'Handjet, monospace', size: 12 },
          callback: (value) => Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 }),
        },
        border: { color: '#3E3E3E' },
        afterFit: (axis) => {
          axis.width = 60;
        },
        position: 'left',
        beginAtZero: false,
        min: initialYRange.min,
        max: initialYRange.max,
      },
    },
  };

  const handleTypeChanged = (name: string) => {
    setChartType(name);
    const mapped = periodMapping[name];
    if (mapped) setPeriod(mapped);
    if (chartRef.current) chartRef.current.resetZoom();
  };

  // Show a period filter only when the data aggregates into enough buckets to be meaningful —
  // mirrors the tokenomics price chart. Daily is always available; weekly/monthly/yearly appear
  // only once there are at least MIN_DATA_POINTS buckets at that granularity.
  const MIN_DATA_POINTS = 3;
  const periodButtons = useMemo(
    () =>
      (['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).filter((label) => {
        const periodType = periodMapping[label];
        if (periodType === 'day') return true;
        return aggregateByPeriod(initialData, periodType).length >= MIN_DATA_POINTS;
      }),
    [initialData],
  );

  return (
    <div className="w-full">
      <div className="relative" style={{ height: '400px', padding: '10px 20px 20px 20px' }}>
        <div className="absolute left-[80px] top-[5px] z-10 flex items-center gap-2 bg-[#181818] font-handjet">
          {periodButtons.map((name) => (
            <button
              key={name}
              type="button"
              aria-label={`Switch to ${name} view`}
              className={cn(
                'min-w-9 p-px',
                chartType === name
                  ? 'border border-[#3e3e3e] text-highlight shadow-button'
                  : 'hover:text-highlight',
              )}
              onClick={() => handleTypeChanged(name)}
            >
              <div className="flex items-center justify-center px-2 py-0 text-base leading-6 hover:text-highlight">
                {name}
              </div>
            </button>
          ))}
        </div>

        {scaledData.length === 0 ? (
          <div className="ml-10 flex h-full items-center justify-center rounded border border-[#3E3E3E] bg-table_row">
            <p className="font-sfpro text-base text-white/70">Data is currently unavailable</p>
          </div>
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>

      <div className="mt-1 flex justify-center">
        <div className="flex items-center space-x-6 rounded px-4" style={{ backgroundColor: '#1E1E1E' }}>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-sm border border-white" style={{ backgroundColor: '#4FB848' }} />
            <span className="font-sfpro text-sm text-white">{`Hashrate (${unit})`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoneroHashrateChart;
