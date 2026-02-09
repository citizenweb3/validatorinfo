import { getAddress } from 'viem';

import logger from '@/logger';
import providersMonikersData from '@/server/tools/chains/aztec/utils/providers_monikers.json';

const { logInfo, logError, logWarn } = logger('aztec-nodes');

const AZTEC_PROVIDERS_API = 'https://d10cun7h2qqnvc.cloudfront.net/api/providers';

export interface AztecProviderApiResponse {
  providers: Array<{
    id: string;
    name: string;
    commission: number;
    delegators: number;
    currentStake?: string;
    totalStaked: string;
    address: string;
    description: string;
    website: string;
    logo_url: string;
    email: string;
    discord: string;
  }>;
}

export interface ProviderMetadata {
  name: string;
  website: string;
  description: string;
  logoUrl?: string;
}

export const fetchProviderMetadata = async (includeLogo = false): Promise<Map<string, ProviderMetadata>> => {
  try {
    logInfo('Attempting to fetch provider metadata from API');

    const response = await fetch(AZTEC_PROVIDERS_API, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.5',
        Connection: 'keep-alive',
        Host: 'd10cun7h2qqnvc.cloudfront.net',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
      },
    });

    if (!response.ok) {
      logWarn(`Failed to fetch provider metadata from API: ${response.statusText}, falling back to local JSON`);
      return loadProviderMetadataFromFile(includeLogo);
    }

    const data: AztecProviderApiResponse = await response.json();
    const providerMetadata = new Map<string, ProviderMetadata>();

    for (const provider of data.providers) {
      const checksummedAddress = getAddress(provider.address);
      const metadata: ProviderMetadata = {
        name: provider.name,
        website: provider.website || '',
        description: provider.description || '',
      };

      if (includeLogo && provider.logo_url) {
        metadata.logoUrl = provider.logo_url;
      }

      providerMetadata.set(checksummedAddress, metadata);
    }

    logInfo(`Fetched ${providerMetadata.size} provider metadata entries from API`);
    return providerMetadata;
  } catch (e: any) {
    logWarn(`Error fetching provider metadata from API: ${e.message}, falling back to local JSON`);
    return loadProviderMetadataFromFile(includeLogo);
  }
};

const loadProviderMetadataFromFile = (includeLogo = false): Map<string, ProviderMetadata> => {
  try {
    const data = providersMonikersData as AztecProviderApiResponse;
    const providerMetadata = new Map<string, ProviderMetadata>();

    for (const provider of data.providers) {
      const checksummedAddress = getAddress(provider.address);
      const metadata: ProviderMetadata = {
        name: provider.name,
        website: provider.website || '',
        description: provider.description || '',
      };

      if (includeLogo && provider.logo_url) {
        metadata.logoUrl = provider.logo_url;
      }

      providerMetadata.set(checksummedAddress, metadata);
    }

    logInfo(`Loaded ${providerMetadata.size} provider metadata entries from local JSON file`);
    return providerMetadata;
  } catch (e: any) {
    logError(`Error loading provider metadata from local JSON file: ${e.message}`);
    return new Map();
  }
};
