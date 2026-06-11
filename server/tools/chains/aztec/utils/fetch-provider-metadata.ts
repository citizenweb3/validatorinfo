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
    providerSelfStake?: string[] | null;
  }>;
}

export interface ProviderMetadata {
  name: string;
  website: string;
  description: string;
  logoUrl?: string;
}

const isValidProvidersResponse = (data: any): data is AztecProviderApiResponse =>
  Boolean(data) && Array.isArray(data.providers);

// The API is third-party: truthy non-string fields (e.g. name: {}) must not reach
// node persistence, where they would crash .startsWith()/Prisma and drop the node.
const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const loadProvidersFromFile = (): AztecProviderApiResponse => {
  const data = providersMonikersData as AztecProviderApiResponse;

  if (!isValidProvidersResponse(data)) {
    logError('Local providers JSON file has invalid shape, returning empty providers list');
    return { providers: [] };
  }

  logInfo(`Loaded ${data.providers.length} providers from local JSON file`);
  return data;
};

export const fetchProvidersApiResponse = async (): Promise<AztecProviderApiResponse> => {
  try {
    logInfo('Attempting to fetch providers from API');

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
      logWarn(`Failed to fetch providers from API: ${response.statusText}, falling back to local JSON`);
      return loadProvidersFromFile();
    }

    const data = await response.json();

    if (!isValidProvidersResponse(data)) {
      logWarn('Providers API returned invalid payload shape, falling back to local JSON');
      return loadProvidersFromFile();
    }

    logInfo(`Fetched ${data.providers.length} providers from API`);
    return data;
  } catch (e: any) {
    logWarn(`Error fetching providers from API: ${e.message}, falling back to local JSON`);
    return loadProvidersFromFile();
  }
};

export const buildProviderMetadata = (
  data: AztecProviderApiResponse,
  includeLogo = false,
): Map<string, ProviderMetadata> => {
  const providerMetadata = new Map<string, ProviderMetadata>();

  for (const provider of data.providers) {
    try {
      const checksummedAddress = getAddress(provider.address);
      const metadata: ProviderMetadata = {
        name: asString(provider.name),
        website: asString(provider.website),
        description: asString(provider.description),
      };

      const logoUrl = asString(provider.logo_url);
      if (includeLogo && logoUrl) {
        metadata.logoUrl = logoUrl;
      }

      providerMetadata.set(checksummedAddress, metadata);
    } catch (e: any) {
      logWarn(`Skipping provider ${provider?.id ?? '?'} with invalid address: ${provider?.address}`);
    }
  }

  return providerMetadata;
};

export const buildProviderSelfStakeMap = (data: AztecProviderApiResponse): Map<string, string> => {
  const attesterClaims = new Map<string, string[]>();

  for (const provider of data.providers) {
    try {
      if (!provider?.providerSelfStake?.length) {
        continue;
      }

      const providerAddress = getAddress(provider.address);

      for (const attester of provider.providerSelfStake) {
        try {
          const checksummedAttester = getAddress(attester);
          const claims = attesterClaims.get(checksummedAttester) ?? [];
          // Repeats within the same provider's list are data sloppiness, not an
          // ownership conflict - only distinct providers count as competing claims.
          if (!claims.includes(providerAddress)) {
            claims.push(providerAddress);
          }
          attesterClaims.set(checksummedAttester, claims);
        } catch {
          logWarn(`Skipping invalid attester address in providerSelfStake of provider ${provider.id}: ${attester}`);
        }
      }
    } catch {
      logWarn(`Skipping malformed provider entry in providerSelfStake build: ${JSON.stringify(provider)?.slice(0, 200)}`);
    }
  }

  const selfStakeMap = new Map<string, string>();

  for (const [attester, claims] of Array.from(attesterClaims.entries())) {
    if (claims.length > 1) {
      logWarn(
        `Attester ${attester} claimed in providerSelfStake by multiple providers (${claims.join(', ')}), ` +
        'quarantined - keeping it anonymous until the source is corrected',
      );
      continue;
    }
    selfStakeMap.set(attester, claims[0]);
  }

  return selfStakeMap;
};

export const fetchProviderMetadata = async (includeLogo = false): Promise<Map<string, ProviderMetadata>> => {
  const data = await fetchProvidersApiResponse();
  const providerMetadata = buildProviderMetadata(data, includeLogo);
  logInfo(`Built ${providerMetadata.size} provider metadata entries`);
  return providerMetadata;
};
