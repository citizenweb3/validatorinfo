'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useMemo, useState } from 'react';

import icons from '@/components/icons';
import { SimulatorChainData } from '@/actions/simulator';
import { cn } from '@/utils/cn';

type SortField = 'name' | 'apr' | 'reward' | 'rewardUsd' | 'totalReturn';
type SortDir = 'asc' | 'desc';

interface OwnProps {
  chains: SimulatorChainData[];
  stakeAmount: number;
  durationDays: number;
  isCompounding: boolean;
}

const calculateReward = (amount: number, apr: number, days: number, compounding: boolean): number => {
  if (apr <= 0 || days <= 0 || amount <= 0) return 0;

  if (compounding) {
    const periodsPerYear = 365;
    const ratePerPeriod = apr / 100 / periodsPerYear;
    const totalValue = amount * Math.pow(1 + ratePerPeriod, days);
    return totalValue - amount;
  }

  return amount * (apr / 100) * (days / 365);
};

const ComparisonTable: FC<OwnProps> = ({ chains, stakeAmount, durationDays, isCompounding }) => {
  const t = useTranslations('StakingSimulator');
  const [sortField, setSortField] = useState<SortField>('reward');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const rows = useMemo(() => {
    return chains.map((chain) => {
      const reward = calculateReward(stakeAmount, chain.apr, durationDays, isCompounding);
      const rewardUsd = reward * chain.tokenPrice;
      const totalReturn = stakeAmount > 0 ? (reward / stakeAmount) * 100 : 0;

      return {
        ...chain,
        reward,
        rewardUsd,
        totalReturn,
      };
    });
  }, [chains, stakeAmount, durationDays, isCompounding]);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortField) {
        case 'name':
          aVal = a.prettyName;
          bVal = b.prettyName;
          break;
        case 'apr':
          aVal = a.apr;
          bVal = b.apr;
          break;
        case 'reward':
          aVal = a.reward;
          bVal = b.reward;
          break;
        case 'rewardUsd':
          aVal = a.rewardUsd;
          bVal = b.rewardUsd;
          break;
        case 'totalReturn':
          aVal = a.totalReturn;
          bVal = b.totalReturn;
          break;
        default:
          aVal = a.reward;
          bVal = b.reward;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [rows, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const headerClass =
    'cursor-pointer bg-table_row bg-clip-padding shadow-[0_4px_4px_rgba(0,0,0,0.8)] border-x-2 border-transparent text-center py-3 px-2';

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>;
  };

  if (chains.length === 0) {
    return null;
  }

  return (
    <div className="my-4 overflow-x-auto">
      <table className="relative w-full table-auto border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th
              className={headerClass}
              onClick={() => handleSort('name')}
              aria-sort={sortField === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center justify-center font-normal">
                {t('Table.Network')}{renderSortIndicator('name')}
              </div>
            </th>
            <th
              className={headerClass}
              onClick={() => handleSort('apr')}
              aria-sort={sortField === 'apr' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center justify-center font-normal">
                {t('Table.APR')}{renderSortIndicator('apr')}
              </div>
            </th>
            <th
              className={headerClass}
              onClick={() => handleSort('reward')}
              aria-sort={sortField === 'reward' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center justify-center font-normal">
                {t('Table.Estimated Reward')}{renderSortIndicator('reward')}
              </div>
            </th>
            <th
              className={headerClass}
              onClick={() => handleSort('rewardUsd')}
              aria-sort={sortField === 'rewardUsd' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center justify-center font-normal">
                {t('Table.Reward USD')}{renderSortIndicator('rewardUsd')}
              </div>
            </th>
            <th
              className={headerClass}
              onClick={() => handleSort('totalReturn')}
              aria-sort={sortField === 'totalReturn' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center justify-center font-normal">
                {t('Table.Total Return')}{renderSortIndicator('totalReturn')}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id} className="group bg-table_row font-handjet shadow-md hover:bg-table_header">
              <td className="px-2 py-2">
                <Link
                  href={`/networks/${row.name}`}
                  className="flex items-center gap-2 hover:text-highlight"
                  aria-label={`${t('View')} ${row.prettyName}`}
                >
                  <Image
                    src={row.logoUrl || icons.AvatarIcon}
                    alt={row.prettyName}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <span className="text-lg">{row.prettyName}</span>
                </Link>
              </td>
              <td className="px-2 py-2 text-center text-lg">
                {row.apr.toFixed(2)}%
              </td>
              <td className="px-2 py-2 text-center text-lg text-highlight">
                {row.reward.toFixed(4)} {row.denom}
              </td>
              <td className={cn('px-2 py-2 text-center text-lg', row.tokenPrice > 0 ? 'text-highlight' : 'text-primary')}>
                {row.tokenPrice > 0 ? `$${row.rewardUsd.toFixed(2)}` : '-'}
              </td>
              <td className="px-2 py-2 text-center text-lg">
                {row.totalReturn.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
