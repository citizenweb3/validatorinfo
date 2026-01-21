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
import { FC, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

import { getAztecTvsData } from '@/actions/aztec-tvs';
import { PeriodType, TvsDataPoint } from '@/services/aztec-db-service';
import { shadowPlugin } from '@/components/chart/chart-shadow-plugin';
import { crosshairPlugin } from '@/components/chart/chart-crosshair-plugin';
import ChartButtons from '@/app/comparevalidators/chart-buttons';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin, shadowPlugin, crosshairPlugin);

// Set to true to use mock data for testing
const USE_MOCK_DATA = false;

// Generate mock TVS data for testing
const generateMockData = (period: PeriodType): TvsDataPoint[] => {
  const now = new Date();
  const data: TvsDataPoint[] = [];

  let numPoints: number;
  let dateStep: number; // in days

  switch (period) {
    case 'day':
      numPoints = 30;
      dateStep = 1;
      break;
    case 'week':
      numPoints = 12;
      dateStep = 7;
      break;
    case 'month':
      numPoints = 12;
      dateStep = 30;
      break;
    case 'year':
      numPoints = 5;
      dateStep = 365;
      break;
    default:
      numPoints = 30;
      dateStep = 1;
  }

  // Start TVS around 25% and gradually increase with some volatility
  let tvs = 25 + Math.random() * 5;
  const totalSupply = 1000000000; // 1 billion AZTEC

  for (let i = numPoints - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * dateStep);

    // Add some realistic volatility (-2% to +3% change)
    tvs += (Math.random() - 0.4) * 3;
    tvs = Math.max(15, Math.min(60, tvs)); // Keep between 15% and 60%

    const totalStaked = Math.round((tvs / 100) * totalSupply);

    data.push({
      date: date.toISOString(),
      tvs: parseFloat(tvs.toFixed(2)),
      totalStaked,
      totalSupply,
    });
  }

  return data;
};

interface OnwProps {
  chainName: string;
}

const periodMapping: Record<string, PeriodType> = {
  Daily: 'day',
  Weekly: 'week',
  Monthly: 'month',
  Yearly: 'year',
};

const NetworkTvsAztecChart: FC<OnwProps> = ({ chainName }) => {
  const [period, setPeriod] = useState<PeriodType>('day');
  const [chartType, setChartType] = useState<string>('Daily');
  const [data, setData] = useState<TvsDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (USE_MOCK_DATA) {
          const mockData = generateMockData(period);
          setData(mockData);
        } else {
          const tvsData = await getAztecTvsData(chainName, period);
          setData(tvsData);
        }
      } catch (error) {
        console.error('Error fetching TVS data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chainName, period]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (period === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === 'week') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (period === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      return date.getFullYear().toString();
    }
  };

  const getAdaptiveYMax = (): number => {
    if (data.length === 0) return 100;
    const maxValue = Math.max(...data.map((point) => point.tvs));
    if (maxValue <= 10) return 20;
    if (maxValue <= 20) return 40;
    if (maxValue <= 50) return 70;
    return 100;
  };

  const yAxisMax = getAdaptiveYMax();

  const chartData = {
    labels: data.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: 'TVS',
        data: data.map((point) => point.tvs),
        borderColor: '#4FB848',
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
        fill: false,
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
        titleColor: '#E5C46B',
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
            return `  TVS    ${value.toFixed(2)}%`;
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
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
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
          color: '#FFFFFF',
          font: {
            family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 13,
            weight: 400,
          },
          maxRotation: 0,
          minRotation: 0,
          padding: 4,
        },
        border: {
          color: '#3E3E3E',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            family: 'Handjet, monospace',
            size: 12,
          },
          callback: (value) => `${value}`,
        },
        border: {
          color: '#3E3E3E',
        },
        beginAtZero: true,
        max: yAxisMax,
      },
    },
  };

  const handleTypeChanged = (name: string) => {
    setChartType(name);
    const mappedPeriod = periodMapping[name];
    if (mappedPeriod) {
      setPeriod(mappedPeriod);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-center">
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
          backgroundColor: '#1E1E1E',
          padding: '30px 20px 20px 20px',
          borderRadius: '4px',
        }}
      >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="font-sfpro text-lg text-white opacity-70">Loading TVS data...</div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="font-sfpro text-lg text-white opacity-70">No TVS data available</div>
            </div>
          ) : (
            <Line data={chartData} options={options} />
          )}
      </div>

      <div className="mt-1 flex justify-center">
        <div className="flex items-center space-x-3 rounded px-4 py-2" style={{ backgroundColor: '#1E1E1E' }}>
          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#4FB848' }}></div>
          <span className="font-sfpro text-sm text-white">Total Value Staked (TVS %)</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkTvsAztecChart;
