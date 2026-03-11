import { FC } from 'react';

import ChainService from '@/services/chain-service';

import NetworkHealthCards from './network-health-cards';

interface OwnProps {
  selectedEcosystem?: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

const NetworkHealthOverview: FC<OwnProps> = async ({ selectedEcosystem, searchParams }) => {
  const ecosystemHealth = await ChainService.getEcosystemHealthOverview();

  return (
    <NetworkHealthCards ecosystems={ecosystemHealth} selectedEcosystem={selectedEcosystem} searchParams={searchParams} />
  );
};

export default NetworkHealthOverview;
