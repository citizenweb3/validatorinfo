import logger from '@/logger';
import { ChainNodeType } from '@/server/tools/chains/chain-indexer';

const { logError } = logger('fetch-namada-infrastructure');

interface NamadaRPCEntry {
  'RPC Address': string;
  'Team or Contributor Name': string;
  'Discord UserName'?: string;
  'GitHub Account'?: string;
}

interface NamadaMASPEntry {
  'Indexer API URL': string;
  'Team or Contributor Name': string;
  'Discord UserName'?: string;
  'GitHub Account'?: string;
}

interface NamadaNode {
  type: ChainNodeType;
  url: string;
  provider: string;
}

const NAMADA_REGISTRIES = {
  mainnet: {
    rpc: 'https://raw.githubusercontent.com/Luminara-Hub/namada-ecosystem/main/user-and-dev-tools/mainnet/rpc.json',
    indexer:
      'https://raw.githubusercontent.com/Luminara-Hub/namada-ecosystem/main/user-and-dev-tools/mainnet/namada-indexers.json',
  },
  testnet: {
    rpc: 'https://raw.githubusercontent.com/Luminara-Hub/namada-ecosystem/main/user-and-dev-tools/testnet/housefire/rpc.json',
    indexer:
      'https://raw.githubusercontent.com/Luminara-Hub/namada-ecosystem/main/user-and-dev-tools/testnet/housefire/namada-indexers.json',
  },
};

const fetchRPCEndpoints = async (url: string): Promise<NamadaNode[]> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      logError(`Failed to fetch RPC endpoints from ${url}: ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as NamadaRPCEntry[];

    return data
      .filter((entry) => entry['RPC Address'] && entry['Team or Contributor Name'])
      .map((entry) => ({
        type: 'rpc' as ChainNodeType,
        url: entry['RPC Address'],
        provider: entry['Team or Contributor Name'],
      }));
  } catch (error) {
    logError(`Error fetching RPC endpoints from ${url}:`, error);
    return [];
  }
};

const fetchIndexerEndpoints = async (url: string): Promise<NamadaNode[]> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      logError(`Failed to fetch indexer endpoints from ${url}: ${response.statusText}`);
      return [];
    }

    const data = (await response.json()) as NamadaMASPEntry[];

    return data
      .filter((entry) => entry['Indexer API URL'] && entry['Team or Contributor Name'])
      .map((entry) => ({
        type: 'indexer' as ChainNodeType,
        url: entry['Indexer API URL'],
        provider: entry['Team or Contributor Name'],
      }));
  } catch (e) {
    logError(`Error fetching indexer endpoints from ${url}:`, e);
    return [];
  }
};

export const fetchNamadaInfrastructure = async (chainName: string): Promise<NamadaNode[]> => {
  const isTestnet = chainName.toLowerCase().includes('housefire') || chainName.toLowerCase().includes('testnet');

  const network = isTestnet ? 'testnet' : 'mainnet';
  const registries = NAMADA_REGISTRIES[network];

  const [rpcNodes, indexerNodes] = await Promise.all([
    fetchRPCEndpoints(registries.rpc),
    fetchIndexerEndpoints(registries.indexer),
  ]);

  return [...rpcNodes, ...indexerNodes];
};

export default fetchNamadaInfrastructure;
