'use client';

import { useTranslations } from 'next-intl';
import { FC, useMemo, useState } from 'react';

import DeveloperActivityTableItem from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-table-item';
import SortButton from '@/components/common/sort-button';
import BaseTable from '@/components/common/table/base-table';
import BaseTableHeaderCell from '@/components/common/table/base-table-header-cell';
import { SortDirection } from '@/server/types';
import { GithubRepositoryWithCommitCount } from '@/services/github-service';

interface OwnProps {
  items: GithubRepositoryWithCommitCount[];
}

const DeveloperActivityTable: FC<OwnProps> = ({ items }) => {
  const t = useTranslations('NetworkDevInfo.DeveloperActivity');

  const [sortBy, setSortBy] = useState<'name' | 'commits'>('commits');
  const [sortOrder, setSortOrder] = useState<SortDirection>('desc');

  const handleSort = (field: 'name' | 'commits') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedItems = useMemo(() => {
    if (!items || items.length === 0) return items;

    return [...items].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'commits') {
        comparison = a.totalCommits - b.totalCommits;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [items, sortBy, sortOrder]);

  if (!items || items.length === 0) {
    return <div className="my-20 py-8 text-center font-sfpro text-lg bg-table_row">{t('no repositories')}</div>;
  }

  return (
    <div>
      <BaseTable className="my-12">
        <thead>
          <tr className="bg-table_header">
            <BaseTableHeaderCell className="py-3" onClick={() => handleSort('name')}>
              <div className="flex items-center justify-center gap-2 text-sm">
                <SortButton isActive={sortBy === 'name'} direction={sortBy === 'name' ? sortOrder : 'asc'} />
                <span>{t('Table.Repository Name.name')}</span>
              </div>
            </BaseTableHeaderCell>
            <BaseTableHeaderCell className="py-3" onClick={() => handleSort('commits')}>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span>{t('Table.Language.name')}</span>
              </div>
            </BaseTableHeaderCell>
            <BaseTableHeaderCell className="py-3" onClick={() => handleSort('commits')}>
              <div className="flex items-center justify-center gap-2 text-sm">
                <SortButton isActive={sortBy === 'commits'} direction={sortBy === 'commits' ? sortOrder : 'asc'} />
                <span>{t('Table.Commits.name')}</span>
              </div>
            </BaseTableHeaderCell>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <DeveloperActivityTableItem key={item.id} item={item} />
          ))}
        </tbody>
      </BaseTable>
    </div>
  );
};

export default DeveloperActivityTable;
