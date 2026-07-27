import type { GenesisProfile } from '@/server/tools/genesis/profile';

const COVERAGE_TIMEOUT_MS = 15_000;

export type GenesisCoverage = {
  earliestHeight: bigint;
  earliestTime: Date;
};

type CoverageOptions = {
  baseUrl?: string;
  apiKey?: string;
  fetcher?: typeof fetch;
};

const readCoverageConfig = (profile: GenesisProfile, options: CoverageOptions) => {
  const prefix = profile.chainName === 'cosmoshub' ? 'COSMOS' : 'ATOMONE';
  const baseUrl = options.baseUrl ?? process.env[`${prefix}_INDEXER_BASE_URL`];
  const apiKey = options.apiKey ?? process.env[`${prefix}_INDEXER_API_KEY`];
  if (!baseUrl) throw new Error(`${prefix}_INDEXER_BASE_URL is required for genesis coverage validation`);
  if (!apiKey) throw new Error(`${prefix}_INDEXER_API_KEY is required for genesis coverage validation`);
  return { baseUrl: baseUrl.replace(/\/$/, ''), apiKey };
};

export const fetchGenesisCoverage = async (
  profile: GenesisProfile,
  options: CoverageOptions = {},
): Promise<GenesisCoverage> => {
  const { baseUrl, apiKey } = readCoverageConfig(profile, options);
  const response = await (options.fetcher ?? fetch)(`${baseUrl}/api/v1/coverage`, {
    headers: { 'x-api-key': apiKey },
    signal: AbortSignal.timeout(COVERAGE_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`indexer coverage request failed with HTTP ${response.status}`);

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || !('data' in payload)) {
    throw new Error('indexer coverage response has no data object');
  }
  const data = (payload as { data: unknown }).data;
  if (!data || typeof data !== 'object') throw new Error('indexer coverage data must be an object');
  const earliestHeightValue = (data as Record<string, unknown>).earliest_height;
  const earliestTimeValue = (data as Record<string, unknown>).earliest_time;
  if (typeof earliestHeightValue !== 'string' || !/^\d+$/.test(earliestHeightValue)) {
    throw new Error('indexer coverage earliest_height must be an unsigned integer string');
  }
  if (typeof earliestTimeValue !== 'string' || Number.isNaN(Date.parse(earliestTimeValue))) {
    throw new Error('indexer coverage earliest_time must be an ISO timestamp');
  }

  const earliestHeight = BigInt(earliestHeightValue);
  if (!profile.compatibleCoverageHeights.includes(earliestHeight)) {
    throw new Error(`indexer coverage height ${earliestHeight} is incompatible with ${profile.chainId} genesis`);
  }

  return { earliestHeight, earliestTime: new Date(earliestTimeValue) };
};
