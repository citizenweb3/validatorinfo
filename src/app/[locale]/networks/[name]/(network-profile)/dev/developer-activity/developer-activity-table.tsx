'use client';

import { useTranslations } from 'next-intl';
import { FC, useMemo, useState } from 'react';

import DeveloperActivityTableItem from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-table-item';
import SortButton from '@/components/common/sort-button';
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
    return <div className="mt-4 py-8 text-center font-sfpro text-lg">{t('no repositories')}</div>;
  }

  return (
    <div>
      <table className="mt-4 w-full table-auto border-collapse">
        <thead>
          <tr className="bg-table_header text-sm font-bold">
            <th className="hover:bg-gray-100 cursor-pointer py-3 transition-colors" onClick={() => handleSort('name')}>
              <div className="flex items-center justify-center gap-2">
                <SortButton isActive={sortBy === 'name'} direction={sortBy === 'name' ? sortOrder : 'asc'} />
                <span>{t('Table.Repository Name.name')}</span>
              </div>
            </th>
            <th
              className="hover:bg-gray-100 cursor-pointer py-3 transition-colors"
              onClick={() => handleSort('commits')}
            >
              <div className="flex items-center justify-center gap-2">
                <SortButton isActive={sortBy === 'commits'} direction={sortBy === 'commits' ? sortOrder : 'asc'} />
                <span>{t('Table.Commits.name')}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((item) => (
            <DeveloperActivityTableItem key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeveloperActivityTable;
