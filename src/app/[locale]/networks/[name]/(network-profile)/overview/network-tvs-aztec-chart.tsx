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

import ChartButtons from '../../../../comparevalidators/chart-buttons';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

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
        const tvsData = await getAztecTvsData(chainName, period);
        setData(tvsData);
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

  const chartData = {
    labels: data.map((point) => formatDate(point.date)),
    datasets: [
      {
        label: 'TVS',
        data: data.map((point) => point.tvs),
        borderColor: '#4FB848',
        backgroundColor: 'rgba(79, 184, 72, 0.15)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
        fill: true,
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
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: '#444444',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 12,
          weight: 600,
        },
        bodyFont: {
          family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
          size: 13,
        },
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const dataPoint = data[index];

            if (!dataPoint) {
              return `TVS: ${context.parsed.y.toFixed(2)}%`;
            }

            return [
              `TVS: ${dataPoint.tvs.toFixed(2)}%`,
              `Total Staked: ${dataPoint.totalStaked.toLocaleString()} AZTEC`,
              `Total Supply: ${dataPoint.totalSupply.toLocaleString()} AZTEC`,
            ];
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
          display: false,
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
        },
        border: {
          color: '#444444',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#FFFFFF',
          font: {
            family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 14,
          },
          callback: (value) => `${value}`,
        },
        border: {
          color: '#444444',
        },
        beginAtZero: true,
        max: 100,
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
