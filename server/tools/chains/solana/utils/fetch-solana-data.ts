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

const fetchSolanaData = async <T>(method: string): Promise<T> => {
  const result = await fetch('https://api.mainnet-beta.solana.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params: [],
    }),
  }).then((res) => res.json());

  return result.result as T;
};

export default fetchSolanaData;
