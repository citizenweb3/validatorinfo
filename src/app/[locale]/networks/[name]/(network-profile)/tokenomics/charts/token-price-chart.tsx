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

import { shadowPlugin } from '@/components/chart/chart-shadow-plugin';
import { crosshairPlugin } from '@/components/chart/chart-crosshair-plugin';
import { chartAreaBackgroundPlugin } from '@/components/chart/chart-area-background-plugin';
import { formatNumber } from '@/components/chart/chartHelper';
import ChartButtons from '@/app/comparevalidators/chart-buttons';

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

interface ChartDataPoint {
  date: string;
  value: number;
}

interface OwnProps {
  chartData: ChartDataPoint[];
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

const aggregateByPeriod = (dailyData: ChartDataPoint[], period: PeriodType): ChartDataPoint[] => {
  if (period === 'day') {
    return dailyData;
  }

  const aggregated = new Map<string, ChartDataPoint>();

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
      aggregated.set(key, {
        date: key,
        value: point.value,
      });
    }
  });

  return Array.from(aggregated.values()).sort((a, b) => a.date.localeCompare(b.date));
};

const calculatePriceYMax = (maxValue: number): number => {
  if (maxValue <= 0.01) return 0.02;
  if (maxValue <= 0.1) return 0.2;
  if (maxValue <= 1) return Math.ceil(maxValue * 1.3 * 10) / 10;
  if (maxValue <= 10) return Math.ceil(maxValue * 1.3);
  if (maxValue <= 100) return Math.ceil((maxValue * 1.3) / 10) * 10;
  if (maxValue <= 1000) return Math.ceil((maxValue * 1.3) / 100) * 100;
  return Math.ceil((maxValue * 1.3) / 1000) * 1000;
};

const TokenPriceChart: FC<OwnProps> = ({ chartData }) => {
  const [period, setPeriod] = useState<PeriodType>('day');
  const [chartType, setChartType] = useState<string>('Daily');
  const chartRef = useRef<ChartJS<'line'>>(null);

  const data = useMemo(() => aggregateByPeriod(chartData, period), [chartData, period]);

  const getAdaptiveYMax = useCallback(
    (startIndex: number, endIndex: number): number => {
      if (data.length === 0) return 100;

      const visibleData = data.slice(startIndex, endIndex + 1);
      if (visibleData.length === 0) return 100;

      const maxPrice = Math.max(...visibleData.map((point) => point.value));
      return calculatePriceYMax(maxPrice);
    },
    [data],
  );

  const updateYAxis = useCallback(
    (chart: ChartJS<'line'>) => {
      const xScale = chart.scales.x;
      if (!xScale) return;

      const minIndex = Math.max(0, Math.floor(xScale.min));
      const maxIndex = Math.min(data.length - 1, Math.ceil(xScale.max));

      const yMax = getAdaptiveYMax(minIndex, maxIndex);
      const yScale = chart.scales.y;

      if (yScale && yScale.max !== yMax) {
        yScale.options.max = yMax;
        chart.update('none');
      }
    },
    [data.length, getAdaptiveYMax],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });

    if (period === 'day') {
      return `${day} ${monthShort}`;
    } else if (period === 'week') {
      return `${day} ${monthShort}`;
    } else if (period === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      return date.getFullYear().toString();
    }
  };

  const initialYMax = useMemo(() => {
    if (data.length === 0) return 100;
    const maxPrice = Math.max(...data.map((point) => point.value));
    return calculatePriceYMax(maxPrice);
  }, [data]);

  const lineChartData = {
    labels: data.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: 'Price',
        data: data.map((point) => point.value),
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
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
        titleFont: {
          family: 'Handjet, monospace',
          size: 14,
          weight: 400,
        },
        bodyFont: {
          family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 13,
        },
        callbacks: {
          title: (tooltipItems) => {
            if (tooltipItems.length === 0) return '';
            const index = tooltipItems[0].dataIndex;
            const dataPoint = data[index];
            if (!dataPoint) return '';
            const date = new Date(dataPoint.date);
            return date.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
          },
          label: (context) => {
            const value = context.parsed.y;
            const formatted = value < 0.01 ? value.toPrecision(4) : value.toFixed(2);
            return `  Price    $${formatted}`;
          },
          labelColor: (context) => {
            return {
              borderColor: '#FFFFFF',
              backgroundColor: context.dataset.borderColor as string,
              borderWidth: 1,
            };
          },
        },
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          onPan: ({ chart }) => {
            updateYAxis(chart as ChartJS<'line'>);
          },
          onPanComplete: ({ chart }) => {
            updateYAxis(chart as ChartJS<'line'>);
          },
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
          onZoom: ({ chart }) => {
            updateYAxis(chart as ChartJS<'line'>);
          },
          onZoomComplete: ({ chart }) => {
            updateYAxis(chart as ChartJS<'line'>);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          tickLength: 6,
          tickColor: '#3E3E3E',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Handjet, monospace',
            size: 12,
          },
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
        border: {
          color: '#3E3E3E',
        },
      },
      y: {
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
          tickLength: 6,
          tickColor: '#3E3E3E',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Handjet, monospace',
            size: 12,
          },
          callback: (value) => `$${formatNumber(Number(value))}`,
        },
        border: {
          color: '#3E3E3E',
        },
        position: 'left',
        beginAtZero: false,
        max: initialYMax,
      },
    },
  };

  const handleTypeChanged = (name: string) => {
    setChartType(name);
    const mappedPeriod = periodMapping[name];
    if (mappedPeriod) {
      setPeriod(mappedPeriod);
    }
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-start ml-20">
        <ChartButtons
          isChart={false}
          chartType={chartType}
          onChartChanged={() => {}}
          onTypeChanged={handleTypeChanged}
          onlyDays={true}
        />
      </div>

      <div
        className="relative"
        style={{
          height: '400px',
          padding: '10px 20px 20px 20px',
        }}
      >
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="font-sfpro text-lg text-white opacity-70">No chart data available</div>
          </div>
        ) : (
          <Line ref={chartRef} data={lineChartData} options={options} />
        )}
      </div>

      <div className="mt-1 flex justify-center">
        <div className="flex items-center space-x-6 rounded px-4" style={{ backgroundColor: '#1E1E1E' }}>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-sm border border-white" style={{ backgroundColor: '#4FB848' }}></div>
            <span className="font-sfpro text-sm text-white">Price (USD)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPriceChart;
