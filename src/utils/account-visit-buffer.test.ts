import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type AccountVisitBufferRedis,
  parseAccountVisitSnapshot,
  readAccountVisitSnapshot,
  removeUnchangedAccountVisits,
} from '@/utils/account-visit-buffer';
import { accountViewedKey } from '@/utils/redis-keys';

class FakeVisitRedis implements AccountVisitBufferRedis {
  private readonly values = new Map<string, Map<string, string>>();

  set(key: string, member: string, score: string): void {
    const entries = this.values.get(key) ?? new Map<string, string>();
    entries.set(member, score);
    this.values.set(key, entries);
  }

  members(key: string): string[] {
    return Array.from(this.values.get(key)?.keys() ?? []).sort();
  }

  async zrange(key: string, start: number, stop: number, withScores: 'WITHSCORES'): Promise<string[]> {
    assert.equal(withScores, 'WITHSCORES');
    const entries = Array.from(this.values.get(key)?.entries() ?? []).sort(
      (left, right) => Number(left[1]) - Number(right[1]),
    );
    return entries.slice(start, stop + 1).flatMap(([member, score]) => [member, score]);
  }

  async eval(_script: string, numberOfKeys: number, key: string, ...args: string[]): Promise<number> {
    assert.equal(numberOfKeys, 1);
    const entries = this.values.get(key) ?? new Map<string, string>();
    let removed = 0;
    for (let index = 0; index < args.length; index += 2) {
      if (entries.get(args[index]) !== args[index + 1]) continue;
      entries.delete(args[index]);
      removed += 1;
    }
    return removed;
  }
}

test('visit snapshots reject malformed pairs and preserve invalid scores for safe cleanup', () => {
  assert.throws(() => parseAccountVisitSnapshot(['member-only']), /member\/score pairs/);
  assert.deepEqual(parseAccountVisitSnapshot(['valid', '1700000000000', 'invalid', 'NaN']), [
    { address: 'valid', score: '1700000000000', viewedAt: new Date(1700000000000) },
    { address: 'invalid', score: 'NaN', viewedAt: null },
  ]);
});

test('bounded visit cleanup removes only unchanged snapshot members', async () => {
  const redis = new FakeVisitRedis();
  const key = accountViewedKey('CosmosHub');
  redis.set(key, 'cosmos1unchanged', '100');
  redis.set(key, 'cosmos1reviewed', '200');

  const snapshot = await readAccountVisitSnapshot(redis, 'cosmoshub');
  redis.set(key, 'cosmos1reviewed', '300');
  redis.set(key, 'cosmos1new', '150');

  assert.equal(await removeUnchangedAccountVisits(redis, 'cosmoshub', snapshot), 1);
  assert.deepEqual(redis.members(key), ['cosmos1new', 'cosmos1reviewed']);
});
