import { FC } from 'react';

import ChainService, { EcosystemHealthData } from '@/services/chain-service';

import NetworkHealthCards from './network-health-cards';

interface OwnProps {
  selectedEcosystem?: string;
}

const NetworkHealthOverview: FC<OwnProps> = async ({ selectedEcosystem }) => {
  const ecosystemHealth = await ChainService.getEcosystemHealthOverview();

  return <NetworkHealthCards ecosystems={ecosystemHealth} selectedEcosystem={selectedEcosystem} />;
};

export default NetworkHealthOverview;
