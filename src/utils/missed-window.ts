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

export type MissedWindowMessage =
  | { key: 'missedWindowBlocks'; values: { count: string; hours: string } }
  | { key: 'missedWindowSlots'; values: { count: string; hours: string } }
  | { key: 'missedWindowBlocksNoTime'; values: { count: string } }
  | { key: 'missedWindowSlotsNoTime'; values: { count: string } };

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

export const getMissedWindowMessage = ({ count, usesSlots, hours }: MissedWindow): MissedWindowMessage | null => {
  if (count == null) return null;

  const formattedCount = count.toLocaleString();
  if (hours == null) {
    return usesSlots
      ? { key: 'missedWindowSlotsNoTime', values: { count: formattedCount } }
      : { key: 'missedWindowBlocksNoTime', values: { count: formattedCount } };
  }

  const values = { count: formattedCount, hours: hours.toFixed(1) };
  return usesSlots ? { key: 'missedWindowSlots', values } : { key: 'missedWindowBlocks', values };
};
