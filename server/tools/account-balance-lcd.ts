import db from '@/db';
import { fetchJsonWithFailover } from '@/utils/lcd-request';

const MAX_REST_ENDPOINTS = 10;

export type JobAccountBalanceContext = {
  chainId: number;
  chainName: string;
  coinDecimals: number;
  denom: string;
  minimalDenom: string;
  bech32Prefix: string;
  loadJson: (path: string) => Promise<unknown>;
};

export type JobAccountBalanceJsonOverride = (chainName: string, path: string) => Promise<unknown>;

export const createJobAccountBalanceContext = async (
  chainName: string,
  loadJsonOverride?: JobAccountBalanceJsonOverride,
): Promise<JobAccountBalanceContext | null> => {
  const normalizedChainName = chainName.toLowerCase();
  const chain = await db.chain.findUnique({
    where: { name: normalizedChainName },
    select: {
      id: true,
      name: true,
      params: {
        select: { coinDecimals: true, denom: true, minimalDenom: true, bech32Prefix: true },
      },
      chainNodes: {
        where: { type: 'rest' },
        select: { url: true },
        orderBy: { id: 'asc' },
        take: MAX_REST_ENDPOINTS,
      },
    },
  });
  if (!chain?.params) return null;

  const endpoints = Array.from(new Set(chain.chainNodes.map((node) => node.url.trim()).filter(Boolean)));
  if (!loadJsonOverride && endpoints.length === 0) {
    throw new Error(`no REST endpoints are configured for ${normalizedChainName}`);
  }

  return {
    chainId: chain.id,
    chainName: chain.name,
    coinDecimals: chain.params.coinDecimals,
    denom: chain.params.denom,
    minimalDenom: chain.params.minimalDenom,
    bech32Prefix: chain.params.bech32Prefix,
    loadJson: loadJsonOverride
      ? (path) => loadJsonOverride(normalizedChainName, path)
      : (path) => fetchJsonWithFailover(endpoints, path),
  };
};
