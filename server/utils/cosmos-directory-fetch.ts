import logger from '@/logger';
import fetchData from '@/server/utils/fetch-data';
import { normalizeName } from '@/server/utils/normalize-node-name';

const { logError } = logger('cosmos-directory');

interface CosmosDirectoryChainValidator {
  name: string;
  address: string;
  moniker: string;
  active: boolean;
  jailed: boolean;
  status: string;
  rank?: number;
  commission?: {
    rate: number;
  };
  delegations?: {
    total_tokens: string;
    total_count: number;
    total_usd: number;
  };
  description?: {
    moniker: string;
    identity: string;
    website: string;
    security_contact: string;
    details: string;
  };
  image?: string;
}

export interface CosmosDirectoryValidator {
  path: string;
  name: string;
  identity: string;
  total_usd: number;
  total_users: number;
  chains: CosmosDirectoryChainValidator[];
  profile?: {
    name?: string;
    identity?: string;
    website?: string;
    description?: {
      overview?: string;
      team?: string;
      security?: string;
    };
    contacts?: {
      email?: string;
      telegram?: string;
      twitter?: string;
    };
  };
  services?: Array<{
    title: string;
    description?: string;
    url: string;
  }>;
}

export interface CosmosDirectoryResponse {
  repository: {
    url: string;
    branch: string;
    commit: string;
    timestamp: number;
  };
  validators: CosmosDirectoryValidator[];
}

let cachedData: CosmosDirectoryResponse | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function fetchCosmosDirectory(): Promise<CosmosDirectoryResponse> {
  const now = Date.now();

  if (cachedData && cacheTimestamp && now - cacheTimestamp < CACHE_TTL) {
    return cachedData;
  }

  try {
    const data = await fetchData<CosmosDirectoryResponse>('https://validators.cosmos.directory/', 1000);

    cachedData = data;
    cacheTimestamp = now;

    return data;
  } catch (e) {
    logError('Failed to fetch cosmos.directory:', e);
    throw e;
  }
}

function calculateNameSimilarity(name1: string | null | undefined, name2: string | null | undefined): number {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  if (!norm1 || !norm2) return 0.0;
  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;

  return 0.0;
}

export function findValidatorByName(
  providerName: string | null | undefined,
  cosmosDirectory: CosmosDirectoryResponse,
): CosmosDirectoryValidator | null {
  if (!providerName) return null;

  const MATCH_THRESHOLD = 0.7;

  let bestMatch: { validator: CosmosDirectoryValidator; score: number } | null = null;

  for (const validator of cosmosDirectory.validators) {
    const nameScore = calculateNameSimilarity(validator.name, providerName);

    if (nameScore > MATCH_THRESHOLD && (!bestMatch || nameScore > bestMatch.score)) {
      bestMatch = { validator, score: nameScore };
    }

    for (const chain of validator.chains) {
      const monikerScore = calculateNameSimilarity(chain.moniker, providerName);

      if (monikerScore > MATCH_THRESHOLD && (!bestMatch || monikerScore > bestMatch.score)) {
        bestMatch = { validator, score: monikerScore };
      }
    }
  }

  return bestMatch ? bestMatch.validator : null;
}
