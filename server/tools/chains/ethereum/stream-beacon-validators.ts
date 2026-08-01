import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import { streamArray } from 'stream-json/streamers/StreamArray';

import logger from '@/logger';

const { logError, logInfo } = logger('beacon-validators-ethereum');

const GWEI_PER_ETH = BigInt(1_000_000_000);

export interface BeaconValidatorEntry {
  index: string;
  balance: string;
  status: string;
  validator: { pubkey: string; slashed: boolean };
}

export interface BeaconValidatorSummary {
  total: number;
  active: number;
  slashed: number;
  /** Sum of balances of bonded validators, in wei. */
  bondedWei: string;
}

export const isBonded = (status: string): boolean =>
  status.startsWith('active') || status === 'withdrawal_possible';

/**
 * Streams the Beacon validator set instead of buffering it.
 *
 * The mainnet response is ~1 GB (2.3M entries, of which only ~890k are active),
 * so `res.json()` throws "Cannot create a string longer than 0x1fffffe8
 * characters" — the V8 string limit is 512 MB. Server-side filtering does not
 * help: `?status=active` and `?status=active_ongoing` both return the full set
 * byte for byte, so the node ignores the parameter.
 *
 * Parsing incrementally keeps memory flat (~15 MB heap over the full 1 GB) and
 * lets callers fold each entry without ever materialising the array.
 */
export const streamBeaconValidators = async (
  url: string,
  onEntry?: (entry: BeaconValidatorEntry) => void,
): Promise<BeaconValidatorSummary | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    if (!response.body) {
      throw new Error('Beacon response has no body to stream');
    }

    let total = 0;
    let active = 0;
    let slashed = 0;
    let bondedGwei = BigInt(0);

    const source = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]);

    await pipeline(source, parser(), pick({ filter: 'data' }), streamArray(), async function (entries) {
      for await (const { value } of entries) {
        const entry = value as BeaconValidatorEntry;
        total += 1;
        if (entry.validator.slashed) slashed += 1;
        if (isBonded(entry.status)) {
          active += 1;
          bondedGwei += BigInt(entry.balance);
        }
        onEntry?.(entry);
      }
    });

    const summary: BeaconValidatorSummary = {
      total,
      active,
      slashed,
      bondedWei: (bondedGwei * GWEI_PER_ETH).toString(),
    };

    logInfo(
      `Streamed ${total.toLocaleString()} Beacon validators (${active.toLocaleString()} bonded, ${slashed} slashed)`,
    );

    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    logError(`Streaming the Beacon validator set failed: ${message}`);
    return null;
  }
};

export default streamBeaconValidators;
