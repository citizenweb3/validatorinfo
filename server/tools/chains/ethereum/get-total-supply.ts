import logger from '@/logger';

const { logError, logInfo, logWarn } = logger('get-total-supply-ethereum');

const ETHERSCAN_API_URL = 'https://api.etherscan.io/v2/api';
const COINGECKO_API_URL =
  'https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false';
const ETHEREUM_CHAIN_ID = '1';
const ETHEREUM_DECIMALS = 18;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_SOURCE_DIFFERENCE_PERCENT = BigInt(2);
const PERCENT_SCALE = BigInt(100);
const NON_NEGATIVE_INTEGER_PATTERN = /^\d+$/;

export type EthereumSupplyFetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseNonNegativeInteger = (value: unknown): bigint | null => {
  if (typeof value !== 'string' || !NON_NEGATIVE_INTEGER_PATTERN.test(value)) {
    return null;
  }

  return BigInt(value);
};

const fetchJson = async (url: URL, fetchFn: EthereumSupplyFetch): Promise<unknown> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetchFn(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

export const parseEtherscanTotalSupply = (response: unknown): string | null => {
  if (!isRecord(response) || response.status !== '1' || !isRecord(response.result)) {
    return null;
  }

  const ethSupply = parseNonNegativeInteger(response.result.EthSupply);
  const eth2Staking = parseNonNegativeInteger(response.result.Eth2Staking);
  const burntFees = parseNonNegativeInteger(response.result.BurntFees);

  if (ethSupply === null || eth2Staking === null || burntFees === null) {
    return null;
  }

  const totalSupply = ethSupply + eth2Staking - burntFees;
  return totalSupply > BigInt(0) ? totalSupply.toString() : null;
};

export const convertCoinGeckoTotalSupplyToWei = (totalSupply: unknown): string | null => {
  if (typeof totalSupply !== 'number' || !Number.isFinite(totalSupply) || totalSupply <= 0) {
    return null;
  }

  const decimalSupply = totalSupply.toString();
  const [wholePart, fractionalPart = ''] = decimalSupply.split('.');

  if (
    !NON_NEGATIVE_INTEGER_PATTERN.test(wholePart) ||
    (fractionalPart && !NON_NEGATIVE_INTEGER_PATTERN.test(fractionalPart)) ||
    fractionalPart.length > ETHEREUM_DECIMALS
  ) {
    return null;
  }

  const wei = BigInt(`${wholePart}${fractionalPart.padEnd(ETHEREUM_DECIMALS, '0')}`);
  return wei > BigInt(0) ? wei.toString() : null;
};

const parseCoinGeckoTotalSupply = (response: unknown): string | null => {
  if (!isRecord(response) || !isRecord(response.market_data)) {
    return null;
  }

  return convertCoinGeckoTotalSupplyToWei(response.market_data.total_supply);
};

const fetchEtherscanTotalSupply = async (apiKey: string, fetchFn: EthereumSupplyFetch): Promise<string | null> => {
  const url = new URL(ETHERSCAN_API_URL);
  url.searchParams.set('chainid', ETHEREUM_CHAIN_ID);
  url.searchParams.set('module', 'stats');
  url.searchParams.set('action', 'ethsupply2');
  url.searchParams.set('apikey', apiKey);

  try {
    const response = await fetchJson(url, fetchFn);
    const totalSupply = parseEtherscanTotalSupply(response);

    if (!totalSupply) {
      logError('Etherscan returned an invalid Ethereum total supply payload');
    }

    return totalSupply;
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    logError(`Etherscan Ethereum total supply request failed: ${errorName}`);
    return null;
  }
};

const fetchCoinGeckoTotalSupply = async (fetchFn: EthereumSupplyFetch): Promise<string | null> => {
  try {
    const response = await fetchJson(new URL(COINGECKO_API_URL), fetchFn);
    const totalSupply = parseCoinGeckoTotalSupply(response);

    if (!totalSupply) {
      logError('CoinGecko returned an invalid Ethereum total supply payload');
    }

    return totalSupply;
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    logError(`CoinGecko Ethereum total supply request failed: ${errorName}`);
    return null;
  }
};

export const sourcesDifferBeyondLimit = (primarySupply: string, referenceSupply: string): boolean => {
  const primary = BigInt(primarySupply);
  const reference = BigInt(referenceSupply);
  const difference = primary >= reference ? primary - reference : reference - primary;

  return difference * PERCENT_SCALE > reference * MAX_SOURCE_DIFFERENCE_PERCENT;
};

export const getEthereumTotalSupply = async (
  fetchFn: EthereumSupplyFetch = fetch,
  etherscanApiKey = process.env.ETHERSCAN_API_KEY,
): Promise<string | null> => {
  const apiKey = etherscanApiKey?.trim();
  const etherscanRequest = apiKey ? fetchEtherscanTotalSupply(apiKey, fetchFn) : Promise.resolve(null);

  const [etherscanSupply, coinGeckoSupply] = await Promise.all([etherscanRequest, fetchCoinGeckoTotalSupply(fetchFn)]);

  if (etherscanSupply && coinGeckoSupply && sourcesDifferBeyondLimit(etherscanSupply, coinGeckoSupply)) {
    logWarn(
      `Ethereum supply sources differ by more than 2%: etherscanWei=${etherscanSupply}, coinGeckoWei=${coinGeckoSupply}; using CoinGecko`,
    );
    return coinGeckoSupply;
  }

  if (etherscanSupply) {
    logInfo('Using Etherscan Ethereum total supply');
    return etherscanSupply;
  }

  if (coinGeckoSupply) {
    logInfo('Using CoinGecko Ethereum total supply fallback');
    return coinGeckoSupply;
  }

  logError('Ethereum total supply is unavailable from Etherscan and CoinGecko');
  return null;
};
