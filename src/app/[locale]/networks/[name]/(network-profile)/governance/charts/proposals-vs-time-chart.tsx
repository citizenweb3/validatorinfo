'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartEvent,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { Proposal } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FC, useCallback, useMemo, useRef, useState, useTransition } from 'react';
import { Bar } from 'react-chartjs-2';

import { chartAreaBackgroundPlugin } from '@/components/chart/chart-area-background-plugin';
import { cn } from '@/utils/cn';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  chartAreaBackgroundPlugin,
);

type PeriodType = 'day' | 'week' | 'month' | 'year';

interface OwnProps {
  proposals: Proposal[];
  chainName: string;
}

interface ProposalGroup {
  key: string;
  label: string;
  passed: Proposal[];
  rejected: Proposal[];
  failed: Proposal[];
}

const STATUS_COLORS = {
  passed: '#4FB848',
  rejected: '#AD1818',
  failed: '#E5C46B',
} as const;

const MAX_VISIBLE_GROUPS = 50;
const MIN_VISIBLE_SLOTS = 30;
const BAR_THICKNESS = 14;

const periodMapping: Record<string, PeriodType> = {
  Daily: 'day',
  Weekly: 'week',
  Monthly: 'month',
  Yearly: 'year',
};

const getGroupKey = (date: Date, period: PeriodType): string => {
  switch (period) {
    case 'day':
      return date.toISOString().split('T')[0];
    case 'week': {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return d.toISOString().split('T')[0];
    }
    case 'month':
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    case 'year':
      return String(date.getFullYear());
  }
};

const formatGroupLabel = (key: string, period: PeriodType): string => {
  switch (period) {
    case 'day': {
      const date = new Date(key);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) return 'Today';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    case 'week': {
      const date = new Date(key);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    case 'month': {
      const [year, month] = key.split('-');
      const date = new Date(Number(year), Number(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    case 'year':
      return key;
  }
};

const groupProposals = (proposals: Proposal[], period: PeriodType): ProposalGroup[] => {
  const finished = proposals.filter(
    (p) =>
      p.votingEndTime &&
      (p.status === 'PROPOSAL_STATUS_PASSED' ||
        p.status === 'PROPOSAL_STATUS_REJECTED' ||
        p.status === 'PROPOSAL_STATUS_FAILED'),
  );

  const groups = new Map<string, ProposalGroup>();

  finished.forEach((proposal) => {
    const date = new Date(proposal.votingEndTime!);
    const key = getGroupKey(date, period);

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: formatGroupLabel(key, period),
        passed: [],
        rejected: [],
        failed: [],
      });
    }

    const group = groups.get(key)!;
    if (proposal.status === 'PROPOSAL_STATUS_PASSED') {
      group.passed.push(proposal);
    } else if (proposal.status === 'PROPOSAL_STATUS_REJECTED') {
      group.rejected.push(proposal);
    } else {
      group.failed.push(proposal);
    }
  });

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
};

const ProposalsVsTimeChart: FC<OwnProps> = ({ proposals, chainName }) => {
  const t = useTranslations('NetworkGovernance');
  const router = useRouter();
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const [period, setPeriod] = useState<PeriodType>('day');
  const [chartType, setChartType] = useState<string>('Daily');
  const [isPending, startTransition] = useTransition();

  const allGroups = useMemo(() => groupProposals(proposals, period), [proposals, period]);

  const needsPagination = allGroups.length > MAX_VISIBLE_GROUPS;
  const [pageOffset, setPageOffset] = useState(0);

  const visibleGroups = useMemo(() => {
    if (!needsPagination) return allGroups;
    const startFromEnd = allGroups.length - pageOffset;
    const start = Math.max(0, startFromEnd - MAX_VISIBLE_GROUPS);
    const end = startFromEnd;
    return allGroups.slice(start, end);
  }, [allGroups, needsPagination, pageOffset]);

  const canGoOlder = needsPagination && (allGroups.length - pageOffset - MAX_VISIBLE_GROUPS) > 0;
  const canGoNewer = needsPagination && pageOffset > 0;

  const yMax = useMemo(() => {
    const maxCount = visibleGroups.reduce(
      (max, g) => Math.max(max, g.passed.length + g.rejected.length + g.failed.length),
      0,
    );
    return maxCount + 2;
  }, [visibleGroups]);

  const paddingCount = Math.max(0, MIN_VISIBLE_SLOTS - visibleGroups.length);
  const paddedLabels = useMemo(
    () => [...visibleGroups.map((g) => g.label), ...Array(paddingCount).fill('')],
    [visibleGroups, paddingCount],
  );

  const barChartData = useMemo(
    () => ({
      labels: paddedLabels,
      datasets: [
        {
          label: t('passed'),
          data: [...visibleGroups.map((g) => g.passed.length), ...Array(paddingCount).fill(0)],
          backgroundColor: STATUS_COLORS.passed,
          stack: 'stack0',
          barThickness: BAR_THICKNESS,
        },
        {
          label: t('rejected'),
          data: [...visibleGroups.map((g) => g.rejected.length), ...Array(paddingCount).fill(0)],
          backgroundColor: STATUS_COLORS.rejected,
          stack: 'stack0',
          barThickness: BAR_THICKNESS,
        },
        ...(visibleGroups.some((g) => g.failed.length > 0)
          ? [
            {
              label: 'Failed',
              data: [...visibleGroups.map((g) => g.failed.length), ...Array(paddingCount).fill(0)],
              backgroundColor: STATUS_COLORS.failed,
              stack: 'stack0',
              barThickness: BAR_THICKNESS,
            },
          ]
          : []),
      ],
    }),
    [paddedLabels, visibleGroups, paddingCount, t],
  );

  const handleChartClick = useCallback(
    (_event: ChartEvent, elements: { datasetIndex: number; index: number }[]) => {
      if (elements.length === 0) return;

      const { datasetIndex, index } = elements[0];
      const group = visibleGroups[index];
      if (!group) return;

      let targetProposal: Proposal | undefined;
      if (datasetIndex === 0) targetProposal = group.passed[0];
      else if (datasetIndex === 1) targetProposal = group.rejected[0];
      else targetProposal = group.failed[0];

      if (targetProposal) {
        router.push(`/networks/${chainName}/proposal/${targetProposal.proposalId}`);
      }
    },
    [visibleGroups, chainName, router],
  );

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300,
      },
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      onClick: handleChartClick as ChartOptions<'bar'>['onClick'],
      plugins: {
        legend: {
          display: true,
          position: 'bottom' as const,
          labels: {
            color: '#FFFFFF',
            font: {
              family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
              size: 12,
            },
            usePointStyle: true,
            pointStyle: 'rect' as const,
            padding: 20,
          },
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
          titleFont: {
            family: 'Handjet, monospace',
            size: 14,
            weight: 400 as const,
          },
          bodyFont: {
            family: 'SF Pro, -apple-system, BlinkMacSystemFont, sans-serif',
            size: 13,
          },
          callbacks: {
            title: (tooltipItems) => {
              if (tooltipItems.length === 0) return '';
              const groupIndex = tooltipItems[0].dataIndex;
              const group = visibleGroups[groupIndex];
              if (!group) return '';

              const firstProposal = [...group.passed, ...group.rejected, ...group.failed][0];
              if (!firstProposal?.votingEndTime) return group.label;

              return new Date(firstProposal.votingEndTime).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              });
            },
            label: (context) => {
              const groupIndex = context.dataIndex;
              const group = visibleGroups[groupIndex];
              if (!group) return '';

              const count = context.parsed.y;
              if (count === 0) return '';

              let proposalsInSegment: Proposal[] = [];
              if (context.datasetIndex === 0) proposalsInSegment = group.passed;
              else if (context.datasetIndex === 1) proposalsInSegment = group.rejected;
              else proposalsInSegment = group.failed;

              if (proposalsInSegment.length === 0) return '';

              const lines: string[] = [];
              const maxShow = Math.min(proposalsInSegment.length, 3);
              for (let i = 0; i < maxShow; i++) {
                const p = proposalsInSegment[i];
                const title = p.title.length > 30 ? `${p.title.substring(0, 30)}...` : p.title;
                lines.push(`  #${p.proposalId}  ${title}`);
              }

              if (proposalsInSegment.length > 3) {
                lines.push(`  +${proposalsInSegment.length - 3} more`);
              }

              return lines;
            },
            labelColor: (context) => ({
              borderColor: '#FFFFFF',
              backgroundColor: context.dataset.backgroundColor as string,
              borderWidth: 1,
            }),
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { family: 'Handjet, monospace', size: 12 },
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12,
          },
          border: { color: '#3E3E3E' },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: yMax,
          grid: {
            display: true,
            drawOnChartArea: false,
            drawTicks: true,
            tickLength: 6,
            tickColor: '#3E3E3E',
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { family: 'Handjet, monospace', size: 12 },
            stepSize: 1,
            callback: (value) => (Number.isInteger(value) ? value : ''),
          },
          border: { color: '#3E3E3E' },
        },
      },
    }),
    [handleChartClick, visibleGroups, yMax],
  );

  const handleTypeChanged = useCallback(
    (name: string) => {
      setChartType(name);
      startTransition(() => {
        const mappedPeriod = periodMapping[name];
        if (mappedPeriod) {
          setPeriod(mappedPeriod);
          setPageOffset(0);
        }
      });
    },
    [],
  );

  const handleOlder = useCallback(() => {
    startTransition(() => {
      setPageOffset((prev) => prev + MAX_VISIBLE_GROUPS);
    });
  }, []);

  const handleNewer = useCallback(() => {
    startTransition(() => {
      setPageOffset((prev) => Math.max(0, prev - MAX_VISIBLE_GROUPS));
    });
  }, []);

  const periodButtons = ['Daily', 'Weekly', 'Monthly', 'Yearly'] as const;
  const hasData = allGroups.length > 0;

  return (
    <div className="w-full">
      <div
        className={cn('relative', isPending && 'opacity-60')}
        style={{
          height: '400px',
          padding: '10px 20px 20px 20px',
          transition: 'opacity 0.15s',
        }}
      >
        <div className="absolute left-[70px] top-[5px] z-10 flex items-center gap-2 bg-[#181818] font-handjet">
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

        {needsPagination && (
          <div className="absolute right-[20px] top-[5px] z-10 flex items-center gap-2 bg-[#181818] font-handjet">
            <button
              type="button"
              disabled={!canGoOlder}
              aria-label="Show older proposals"
              className={cn(
                'min-w-9 border border-[#3e3e3e] p-px',
                canGoOlder
                  ? 'hover:text-highlight hover:shadow-button'
                  : 'cursor-not-allowed opacity-30',
              )}
              onClick={handleOlder}
            >
              <div className="flex items-center justify-center px-2 py-0 text-base leading-6">
                &larr;
              </div>
            </button>
            <span className="border border-[#3e3e3e] px-3 py-0 text-base leading-6">
              {visibleGroups[0]?.label} — {visibleGroups[visibleGroups.length - 1]?.label}
            </span>
            <button
              type="button"
              disabled={!canGoNewer}
              aria-label="Show newer proposals"
              className={cn(
                'min-w-9 border border-[#3e3e3e] p-px',
                canGoNewer
                  ? 'hover:text-highlight hover:shadow-button'
                  : 'cursor-not-allowed opacity-30',
              )}
              onClick={handleNewer}
            >
              <div className="flex items-center justify-center px-2 py-0 text-base leading-6">
                &rarr;
              </div>
            </button>
          </div>
        )}

        {hasData ? (
          <Bar ref={chartRef} data={barChartData} options={options} />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="font-handjet text-lg text-white opacity-40">{t('no proposals data')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalsVsTimeChart;
