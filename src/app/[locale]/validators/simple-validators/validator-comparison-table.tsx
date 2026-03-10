'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FC, useMemo } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';
import SortButton from '@/components/common/sort-button';
import TableAvatar from '@/components/common/table/table-avatar';
import Tooltip from '@/components/common/tooltip';
import { SortDirection } from '@/server/types';
import { ValidatorWithStats } from '@/services/validator-service';

import ValidatorHealthBadge from './validator-health-badge';

interface OwnProps {
  validators: ValidatorWithStats[];
  sortBy: string;
  order: SortDirection;
  ecosystems: string[];
  commissionMin: number;
  commissionMax: number;
  uptimeMin: number;
  activeOnly: boolean;
}

type SortField = 'moniker' | 'totalStake' | 'avgCommission' | 'avgUptime' | 'networkCount' | 'governanceRate';

type ComparisonTableKey =
  | 'name'
  | 'nameHint'
  | 'totalStake'
  | 'totalStakeHint'
  | 'commission'
  | 'commissionHint'
  | 'uptime'
  | 'uptimeHint'
  | 'networks'
  | 'networksHint'
  | 'governance'
  | 'governanceHint'
  | 'health'
  | 'healthHint'
  | 'noResults';

const sortableColumns: { field: SortField; nameKey: ComparisonTableKey; hintKey: ComparisonTableKey }[] = [
  { field: 'moniker', nameKey: 'name', hintKey: 'nameHint' },
  { field: 'totalStake', nameKey: 'totalStake', hintKey: 'totalStakeHint' },
  { field: 'avgCommission', nameKey: 'commission', hintKey: 'commissionHint' },
  { field: 'avgUptime', nameKey: 'uptime', hintKey: 'uptimeHint' },
  { field: 'networkCount', nameKey: 'networks', hintKey: 'networksHint' },
  { field: 'governanceRate', nameKey: 'governance', hintKey: 'governanceHint' },
];

const formatStake = (value: number): string => {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toFixed(0);
};

const ValidatorComparisonTable: FC<OwnProps> = ({
  validators,
  sortBy,
  order,
  ecosystems,
  commissionMin,
  commissionMax,
  uptimeMin,
  activeOnly,
}) => {
  const t = useTranslations('ValidatorsPage.ComparisonTable');
  const tHealth = useTranslations('ValidatorsPage.Health');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const healthLabels = {
    excellent: tHealth('excellent'),
    good: tHealth('good'),
    atRisk: tHealth('atRisk'),
    inactive: tHealth('inactive'),
  };

  const filteredValidators = useMemo(() => {
    return validators.filter((v) => {
      if (ecosystems.length > 0) {
        const hasMatchingEcosystem = v.stats.ecosystems.some((e) => ecosystems.includes(e));
        if (!hasMatchingEcosystem) return false;
      }

      if (v.stats.avgCommission * 100 < commissionMin) return false;
      if (v.stats.avgCommission * 100 > commissionMax) return false;

      if (uptimeMin > 0 && (v.stats.avgUptime === null || v.stats.avgUptime < uptimeMin)) return false;

      if (activeOnly && !v.stats.isActive) return false;

      return true;
    });
  }, [validators, ecosystems, commissionMin, commissionMax, uptimeMin, activeOnly]);

  const sortedValidators = useMemo(() => {
    const sorted = [...filteredValidators];

    const getSortValue = (v: ValidatorWithStats, field: string): number | string => {
      switch (field) {
        case 'moniker':
          return v.moniker.toLowerCase();
        case 'totalStake':
          return v.stats.totalStake;
        case 'avgCommission':
          return v.stats.avgCommission;
        case 'avgUptime':
          return v.stats.avgUptime ?? -1;
        case 'networkCount':
          return v.stats.networkCount;
        case 'governanceRate':
          return v.stats.governanceRate;
        default:
          return v.moniker.toLowerCase();
      }
    };

    sorted.sort((a, b) => {
      const aVal = getSortValue(a, sortBy);
      const bVal = getSortValue(b, sortBy);

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      const numA = aVal as number;
      const numB = bVal as number;
      return order === 'asc' ? numA - numB : numB - numA;
    });

    return sorted;
  }, [filteredValidators, sortBy, order]);

  const handleSort = (field: SortField) => {
    const newSp = new URLSearchParams(searchParams.toString());
    const currentSortBy = newSp.get('sortBy');
    const currentOrder = newSp.get('order') ?? 'asc';

    if (currentSortBy === field && currentOrder === 'desc') {
      newSp.delete('sortBy');
      newSp.delete('order');
    } else if (currentSortBy === field && currentOrder === 'asc') {
      newSp.set('sortBy', field);
      newSp.set('order', 'desc');
    } else {
      newSp.set('sortBy', field);
      newSp.set('order', 'asc');
    }

    router.push(`${pathname}?${newSp.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-[200px]">
      <div className="overflow-x-auto">
        <table className="relative w-full table-auto border-separate border-spacing-y-2">
          <thead className="sticky top-0 z-20">
            <tr className="bg-table_header">
              {sortableColumns.map((col) => (
                <th
                  key={col.field}
                  className="cursor-pointer border-x-2 border-transparent bg-table_row bg-clip-padding text-center shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
                  onClick={() => handleSort(col.field)}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortBy === col.field ? (order === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort(col.field);
                    }
                  }}
                >
                  <div className="group flex flex-row items-center justify-center py-3">
                    <div className="flex flex-col items-center justify-center">
                      <SortButton
                        isActive={sortBy === col.field}
                        direction={sortBy === col.field ? order : 'asc'}
                      />
                    </div>
                    <Tooltip tooltip={t(col.hintKey)} direction="top">
                      <div className="w-fit text-wrap text-6xl sm:text-4xl md:text-sm">
                        <div className="text-nowrap font-normal">&nbsp;{t(col.nameKey)}</div>
                      </div>
                    </Tooltip>
                  </div>
                </th>
              ))}
              <th className="border-x-2 border-transparent bg-table_row bg-clip-padding text-center shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                <div className="flex items-center justify-center py-3">
                  <Tooltip tooltip={t('healthHint')} direction="top">
                    <div className="w-fit text-wrap text-6xl sm:text-4xl md:text-sm">
                      <div className="text-nowrap font-normal">&nbsp;{t('health')}</div>
                    </div>
                  </Tooltip>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedValidators.map((validator) => (
              <BaseTableRow key={validator.id}>
                <BaseTableCell className="group/avatar w-1/4 px-2 py-2 font-sfpro hover:text-highlight">
                  <TableAvatar
                    icon={validator.url}
                    name={validator.moniker}
                    href={`/validators/${validator.id}/networks`}
                  />
                </BaseTableCell>
                <BaseTableCell className="px-2 py-2 text-center font-handjet text-6xl sm:text-4xl md:text-sm">
                  {formatStake(validator.stats.totalStake)}
                </BaseTableCell>
                <BaseTableCell className="px-2 py-2 text-center font-handjet text-6xl sm:text-4xl md:text-sm">
                  {(validator.stats.avgCommission * 100).toFixed(1)}%
                </BaseTableCell>
                <BaseTableCell className="px-2 py-2 text-center font-handjet text-6xl sm:text-4xl md:text-sm">
                  <span
                    style={{
                      color:
                        validator.stats.avgUptime === null
                          ? '#3E3E3E'
                          : validator.stats.avgUptime > 99.5
                            ? '#4FB848'
                            : validator.stats.avgUptime >= 95
                              ? '#E5C46B'
                              : '#EB1616',
                    }}
                  >
                    {validator.stats.avgUptime !== null ? `${validator.stats.avgUptime.toFixed(1)}%` : '—'}
                  </span>
                </BaseTableCell>
                <BaseTableCell className="px-2 py-2 text-center font-handjet text-6xl sm:text-4xl md:text-sm">
                  {validator.stats.networkCount}
                </BaseTableCell>
                <BaseTableCell className="px-2 py-2 text-center font-handjet text-6xl sm:text-4xl md:text-sm">
                  {validator.stats.governanceRate.toFixed(0)}%
                </BaseTableCell>
                <BaseTableCell className="px-2 py-2 text-center">
                  <div className="flex items-center justify-center">
                    <ValidatorHealthBadge
                      uptime={validator.stats.avgUptime}
                      isActive={validator.stats.isActive}
                      label={healthLabels}
                    />
                  </div>
                </BaseTableCell>
              </BaseTableRow>
            ))}
            {sortedValidators.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center font-handjet text-sm text-primary">
                  {t('noResults')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidatorComparisonTable;
