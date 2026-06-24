/**
 * Lightweight DTO verification for the Monero indexer client (design §9 stage 2).
 * No test framework in this project — run standalone from the repo root:
 *
 *   npx tsx server/tools/chains/monero/__fixtures__/dto.check.ts
 *
 * Verifies the real captured fixture against the client's parsing: envelope
 * shape, snake_case wire fields, and BigInt difficulty with no precision loss.
 */
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

import { parseDifficultyHex, toBlock, toSupply } from '../indexer-client';
import { parseCryptonoteBlocks, parseNanopoolBlocks, parseObserverBlocks } from '../pool-parse';

const FIX = 'server/tools/chains/monero/__fixtures__/blocks.sample.json';
const env = JSON.parse(readFileSync(FIX, 'utf8')) as {
  data: Array<Record<string, unknown>>;
  pagination: { limit: number; offset: number; order: string; has_more: boolean };
};

// 1. Envelope shape
assert.ok(Array.isArray(env.data) && env.data.length > 0, 'envelope.data is a non-empty array');
assert.ok(env.pagination && typeof env.pagination.has_more === 'boolean', 'pagination.has_more present');
assert.ok(typeof env.pagination.offset === 'number', 'pagination.offset present (offset paging)');

// 2. snake_case wire fields the DTO maps from
const b = env.data[0];
for (const k of [
  'hash', 'prev_hash', 'height', 'timestamp', 'major_version', 'block_size', 'block_weight',
  'num_txes', 'miner_tx_hash', 'reward_atomic', 'difficulty_hex', 'is_canonical', 'is_settled',
]) {
  assert.ok(k in b, `wire field "${k}" present`);
}

// 3. BigInt difficulty parsing (no Number coercion) + precision preservation.
//    Per-block difficulty (~6e11 today) currently fits in Number, but BigInt is
//    correct/future-proof; cumulative_difficulty_hex DOES exceed 2^53 and proves
//    the BigInt path preserves precision with no loss.
const hex = String(b.difficulty_hex);
const diff = parseDifficultyHex(hex);
assert.ok(diff !== null, 'valid difficulty parsed (non-null bigint)');
assert.strictEqual(diff, BigInt(hex.startsWith('0x') ? hex : `0x${hex}`), 'difficulty matches canonical BigInt parse');

const cumHex = String(b.cumulative_difficulty_hex);
const cum = parseDifficultyHex(cumHex);
assert.ok(cum !== null && cum > BigInt(Number.MAX_SAFE_INTEGER), 'cumulative difficulty exceeds 2^53');
assert.strictEqual(cum, BigInt(cumHex.startsWith('0x') ? cumHex : `0x${cumHex}`), 'cumulative round-trips via BigInt (no precision loss)');

// invalid/missing → null so the caller SKIPS (never persists a bogus 0 — F1 / §4.1)
assert.strictEqual(parseDifficultyHex(''), null, 'empty difficulty_hex → null');
assert.strictEqual(parseDifficultyHex(null), null, 'null difficulty_hex → null');
assert.strictEqual(parseDifficultyHex('0xZZ'), null, 'malformed difficulty_hex → null');

// 4. toBlock mapper — camelCase output equals wire values (the §9 DTO acceptance)
const blk = toBlock(b as never);
assert.strictEqual(blk.height, b.height, 'toBlock.height');
assert.strictEqual(blk.hash, b.hash, 'toBlock.hash');
assert.strictEqual(blk.prevHash, b.prev_hash, 'toBlock.prevHash←prev_hash');
assert.strictEqual(blk.txCount, b.num_txes, 'toBlock.txCount←num_txes');
assert.strictEqual(blk.reward, String(b.reward_atomic), 'toBlock.reward←reward_atomic');
assert.strictEqual(blk.size, b.block_size, 'toBlock.size←block_size');
assert.strictEqual(blk.weight, b.block_weight, 'toBlock.weight←block_weight');
assert.strictEqual(blk.minerTxHash, b.miner_tx_hash, 'toBlock.minerTxHash←miner_tx_hash');
assert.strictEqual(blk.isCanonical, b.is_canonical, 'toBlock.isCanonical←is_canonical');
assert.strictEqual(blk.difficulty, diff, 'toBlock.difficulty is BigInt');

// 5. toSupply mapper — emission and fee kept SEPARATE (never summed, design §6)
const supplyEnv = JSON.parse(
  readFileSync('server/tools/chains/monero/__fixtures__/supply.sample.json', 'utf8'),
) as { data: Array<Record<string, unknown>> };
const s = supplyEnv.data[0];
const sup = toSupply(s as never);
assert.strictEqual(sup.cumulativeEmissionAtomic, String(s.cumulative_emission_atomic), 'toSupply emission');
assert.strictEqual(sup.cumulativeFeeAtomic, String(s.cumulative_fee_atomic), 'toSupply fee (separate)');

// 6. Pool parsers against real captured responses → { height, hash, timestamp(seconds) }
const sx = parseCryptonoteBlocks(
  JSON.parse(readFileSync('server/tools/chains/monero/__fixtures__/pool-cryptonote.supportxmr.json', 'utf8')),
);
assert.ok(sx.length > 0 && sx[0].height > 0 && sx[0].hash.length === 64, 'cryptonote parser → blocks');
assert.ok(sx[0].timestamp > 1_600_000_000 && sx[0].timestamp < 2_000_000_000, 'cryptonote ts normalized ms→s');
const p2 = parseObserverBlocks(
  JSON.parse(readFileSync('server/tools/chains/monero/__fixtures__/pool-observer.p2pool.json', 'utf8')),
);
assert.ok(p2.length > 0 && p2[0].height > 0 && p2[0].hash.length === 64, 'observer parser → blocks');

const np = parseNanopoolBlocks(
  JSON.parse(readFileSync('server/tools/chains/monero/__fixtures__/pool-nanopool.json', 'utf8')),
);
assert.ok(np.length > 0 && np[0].height > 0 && np[0].hash.length === 64, 'nanopool parser → blocks (block_number→height)');
assert.ok(np[0].timestamp > 1_600_000_000 && np[0].timestamp < 2_000_000_000, 'nanopool ts (date, seconds)');

console.log(
  `DTO check OK — envelope, mappers, BigInt cum=${cum.toString()}, ` +
    `pool parsers (cryptonote=${sx.length}, p2pool=${p2.length}, nanopool=${np.length})`,
);
