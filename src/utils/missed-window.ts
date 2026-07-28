import { CHAINS_WITH_SLOTS_SET } from '@/utils/chains-with-slots';

// These chains persist avgTxInterval in milliseconds. All other producers used
// by this feature persist seconds; blockTime is not populated for Cosmos/Aztec.
const MILLISECOND_INTERVAL_CHAINS = new Set(['logos-testnet', 'miden-testnet']);

interface MissedWindowInput {
  chainName: string;
  blocksWindow: number | null;
  totalSlots: number | null;
  avgTxInterval: number;
}

export interface MissedWindow {
  count: number | null;
  usesSlots: boolean;
  hours: number | null;
}

export const getMissedWindow = ({
  chainName,
  blocksWindow,
  totalSlots,
  avgTxInterval,
}: MissedWindowInput): MissedWindow => {
  const windowCount = totalSlots ?? blocksWindow;
  const count = windowCount != null && Number.isFinite(windowCount) && windowCount > 0 ? windowCount : null;
  const intervalSeconds = MILLISECOND_INTERVAL_CHAINS.has(chainName) ? avgTxInterval / 1000 : avgTxInterval;
  const hasInterval = Number.isFinite(intervalSeconds) && intervalSeconds > 0;

  return {
    count,
    usesSlots: CHAINS_WITH_SLOTS_SET.has(chainName),
    hours: count != null && hasInterval ? (count * intervalSeconds) / 3600 : null,
  };
};
