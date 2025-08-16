import logger from '@/logger';

export interface SolanaChainNode {
  activatedStake: number;
  commission: number;
  epochCredits: any;
  epochVoteAccount: boolean;
  lastVote: number;
  nodePubkey: string;
  rootSlot: number;
  votePubkey: string;
}

const { logError } = logger('fetch-solana-data');

const fetchSolanaData = async <T>(method: string, params?: any[]): Promise<T> => {
  try {
    const res = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params: params ?? [],
      }),
    });

    if (!res.ok) {
      logError(`HTTP error for method ${method}: status ${res.status}`);
      throw new Error(`HTTP error: ${res.status}`);
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      logError(`Response is not valid JSON for method ${method}:`, e);
      throw e;
    }

    if (!data || typeof data !== 'object') {
      logError(`Unexpected response for method ${method}: ${JSON.stringify(data)}`);
      throw new Error(`Unexpected response format`);
    }

    if ('error' in data) {
      logError(`Solana RPC error: ${JSON.stringify(data.error)}`);
      throw new Error(`Solana RPC error: ${JSON.stringify(data.error)}`);
    }

    if (!('result' in data)) {
      logError(`No result in Solana RPC response: ${JSON.stringify(data)}`);
      throw new Error(`No result in Solana RPC response`);
    }

    return data.result as T;
  } catch (e) {
    logError(`Can't fetch solanaData with method ${method}: ${e}`);
    throw e;
  }
};

export default fetchSolanaData;
