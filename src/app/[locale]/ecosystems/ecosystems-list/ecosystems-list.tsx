import { FC } from 'react';
import { SortDirection } from '@/server/types';
import ChainService from '@/services/chain-service';
import EcosystemsListItem from '@/app/ecosystems/ecosystems-list/ecosystems-list-item';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
}

const EcosystemsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1 }) => {
  const ecosystems = await ChainService.getEcosystemsChains();

  return (
    <tbody>
    {ecosystems.map((item) => (
      <EcosystemsListItem key={item.id} item={item} />
    ))}
    </tbody>
  );
};

export default EcosystemsList;
