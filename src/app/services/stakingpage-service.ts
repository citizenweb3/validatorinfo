import { readFile } from 'fs/promises';
import { resolve } from 'path';

export interface StakingNetworksParams {
  title: string;
  name: string;
  icon?: string;
  stake?: string;
}

const NETWORKS_PATH = resolve(process.cwd(), 'uploads/networks.json');

const getNetworks = async (): Promise<StakingNetworksParams[]> => {
  try {
    const raw = await readFile(NETWORKS_PATH, 'utf-8');
    const data = JSON.parse(raw) as StakingNetworksParams[];

    return Array.isArray(data)
      ? data.map((item) => ({
          title: item.title || item.name || '',
          name: item.name,
          icon: item.icon || '',
          stake: item.stake || '',
        }))
      : [];
  } catch (e) {
    return [];
  }
};

const StakingPageService = {
  getNetworks,
};

export default StakingPageService;
