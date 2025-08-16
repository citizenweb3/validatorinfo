import { FC } from 'react';
import { SortDirection } from '@/server/types';
import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import NetworkAppsItem from '@/app/networks/[id]/(network-profile)/dev/apps-list/apps-item';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const NetworkAppsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  return (
    <tbody>
    {networkProfileExample.apps.map((item) => (
      <NetworkAppsItem key={item.name} item={item} />
    ))}
    </tbody>
  );
};

export default NetworkAppsList;
