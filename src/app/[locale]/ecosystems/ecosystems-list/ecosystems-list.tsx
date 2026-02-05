import { FC } from 'react';
import { SortDirection } from '@/server/types';
import EcosystemsListItem from '@/app/ecosystems/ecosystems-list/ecosystems-list-item';
import ecosystemService from '@/services/ecosystem-service';

interface OwnProps {
  currentPage?: number;
  perPage: number;
  sort: { sortBy: string; order: SortDirection };
  selectedTags?: string[];
}

const EcosystemsList: FC<OwnProps> = async ({ sort, perPage, currentPage = 1, selectedTags = [] }) => {
  const ecosystems = await ecosystemService.getAll();

  const filteredEcosystems = selectedTags.length > 0
    ? ecosystems.filter((eco) => selectedTags.some((tag) => eco.tags.includes(tag)))
    : ecosystems;

  return (
    <tbody>
    {filteredEcosystems.map((item) => (
      <EcosystemsListItem key={item.name} item={item} />
    ))}
    </tbody>
  );
};

export default EcosystemsList;
