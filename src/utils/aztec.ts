export const AZTEC_CHAIN_NAMES = ['aztec', 'aztec-testnet'] as const;

export type AztecChainName = (typeof AZTEC_CHAIN_NAMES)[number];

export const AZTEC_INDEXER_MAX_BLOCK_RANGE = 20;
export const AZTEC_FINALIZED_STATUS_THRESHOLD = 3;

export const isAztecChainName = (chainName: string): chainName is AztecChainName => {
  return AZTEC_CHAIN_NAMES.includes(chainName.toLowerCase() as AztecChainName);
};

export const isAztecFinalizedStatus = (status: number): boolean => {
  return status >= AZTEC_FINALIZED_STATUS_THRESHOLD;
};

export const getAztecFinalizationLabel = (status: number): 'finalized' | 'pending' => {
  return isAztecFinalizedStatus(status) ? 'finalized' : 'pending';
};

export const getAztecBlockHeight = (height: string | number | bigint): number => {
  return Number(height);
};

export const getAztecTimestampMs = (timestamp: string | number | bigint): number => {
  return Number(timestamp);
};

export const getUtcDayStart = (timestampMs: number): Date => {
  const dayStart = new Date(timestampMs);
  dayStart.setUTCHours(0, 0, 0, 0);
  return dayStart;
};
