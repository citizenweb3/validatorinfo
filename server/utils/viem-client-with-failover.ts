import { type PublicClient, type ReadContractParameters, createPublicClient, fallback, http } from 'viem';

import logger from '@/logger';

interface ViemClientOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  enableRanking?: boolean;
  loggerName?: string;
}

// Cache for viem clients to prevent creating new clients for every RPC call
const clientCache = new Map<string, PublicClient>();

const getCacheKey = (rpcUrls: string[]): string => {
  return rpcUrls.sort().join('|');
};

const shouldThrowError = (error: any, loggerName: string): boolean => {
  const { logError, logWarn } = logger(loggerName);
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code;

  if (code === 4001 || code === 5000 || code === -32003) {
    logError(`User or transaction rejection error - will not retry: ${error.message} (code: ${code})`);
    return true;
  }

  if (message.includes('execution reverted') || message.includes('revert')) {
    logError(`Contract execution reverted - will not retry: ${error.message}`);
    return true;
  }

  if (code === -32602 || code === -32601) {
    logError(`Invalid RPC method or parameters - will not retry: ${error.message} (code: ${code})`);
    return true;
  }

  logWarn(`Retryable error encountered - will try next endpoint: ${error.message}`);
  return false;
};

export const createViemClientWithFailover = (rpcUrls: string[], options: ViemClientOptions = {}): PublicClient => {
  const {
    timeout = 30000,
    retryCount = 3,
    retryDelay = 150,
    enableRanking = true,
    loggerName = 'viem-client',
  } = options;

  const { logInfo, logError } = logger(loggerName);

  if (!rpcUrls || rpcUrls.length === 0) {
    throw new Error('No RPC URLs provided for viem client');
  }

  logInfo(`Creating viem client with ${rpcUrls.length} RPC endpoints (ranking: ${enableRanking})`);

  const transports = rpcUrls.map((url) =>
    http(url, {
      timeout,
      retryCount: 0,
    }),
  );

  const client = createPublicClient({
    transport: fallback(transports, {
      retryCount,
      retryDelay,
      rank: enableRanking
        ? {
            interval: 60_000,
            sampleCount: 10,
            timeout: 1_000,
            weights: {
              latency: 0.3,
              stability: 0.7,
            },
          }
        : false,

      shouldThrow: (error) => shouldThrowError(error, loggerName),
    }),
  });

  logInfo('Viem client created successfully with fallback transport');
  return client;
};


export const getOrCreateViemClient = (rpcUrls: string[], loggerName: string): PublicClient => {
  const cacheKey = getCacheKey(rpcUrls);

  const cachedClient = clientCache.get(cacheKey);
  if (cachedClient) {
    return cachedClient;
  }

  const client = createViemClientWithFailover(rpcUrls, {
    loggerName,
    enableRanking: true,
    timeout: 30000,
    retryCount: 3,
    retryDelay: 150,
  });

  clientCache.set(cacheKey, client);
  return client;
};

export const readContractWithFailover = async <T>(
  rpcUrls: string[],
  contractParams: Omit<ReadContractParameters, 'client'>,
  loggerName = 'viem-contract-reader',
): Promise<T> => {
  const { logInfo, logError } = logger(loggerName);

  try {
    logInfo(`Reading contract ${contractParams.address} function ${contractParams.functionName as string}`);

    const client = getOrCreateViemClient(rpcUrls, loggerName);

    const result = await client.readContract(contractParams as any);

    logInfo(`Successfully read contract ${contractParams.address} function ${contractParams.functionName as string}`);

    return result as T;
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown error';
    logError(
      `Contract read failed across all RPC endpoints - contract: ${contractParams.address}, function: ${contractParams.functionName}, error: ${errorMsg}`,
    );

    throw new Error(
      `Failed to read contract ${contractParams.address} function ${contractParams.functionName}: ${errorMsg}`,
    );
  }
};
