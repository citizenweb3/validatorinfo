import { FC } from 'react';
import { SortDirection } from '@/server/types';
import EcosystemsListItem from '@/app/ecosystems/ecosystems-list/ecosystems-list-item';
import ecosystemService from '@/services/ecosystem-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const EcosystemsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const ecosystems = await ecosystemService.getAll();

  return (
    <tbody>
    {ecosystems.map((item) => (
      <EcosystemsListItem key={item.name} item={item} />
    ))}
    </tbody>
  );
};

export default EcosystemsList;
