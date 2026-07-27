import { accountViewedKey } from '@/utils/redis-keys';

const VISIT_DRAIN_BATCH = 500;

const REMOVE_UNCHANGED_VISITS_SCRIPT = `
local removed = 0
for index = 1, #ARGV, 2 do
  if redis.call('ZSCORE', KEYS[1], ARGV[index]) == ARGV[index + 1] then
    removed = removed + redis.call('ZREM', KEYS[1], ARGV[index])
  end
end
return removed
`;

export type AccountVisitSnapshot = {
  address: string;
  score: string;
  viewedAt: Date | null;
};

export interface AccountVisitBufferRedis {
  zrange(key: string, start: number, stop: number, withScores: 'WITHSCORES'): Promise<string[]>;
  eval(script: string, numberOfKeys: number, key: string, ...args: string[]): Promise<unknown>;
}

export const parseAccountVisitSnapshot = (values: readonly string[]): AccountVisitSnapshot[] => {
  if (values.length % 2 !== 0) throw new Error('Redis account visit snapshot must contain member/score pairs');

  const snapshot: AccountVisitSnapshot[] = [];
  for (let index = 0; index < values.length; index += 2) {
    const address = values[index];
    const score = values[index + 1];
    const milliseconds = Number(score);
    const viewedAt = Number.isSafeInteger(milliseconds) && milliseconds > 0 ? new Date(milliseconds) : null;
    snapshot.push({
      address,
      score,
      viewedAt: viewedAt && !Number.isNaN(viewedAt.getTime()) ? viewedAt : null,
    });
  }
  return snapshot;
};

export const readAccountVisitSnapshot = async (
  redis: AccountVisitBufferRedis,
  chainName: string,
): Promise<AccountVisitSnapshot[]> => {
  const values = await redis.zrange(accountViewedKey(chainName), 0, VISIT_DRAIN_BATCH - 1, 'WITHSCORES');
  return parseAccountVisitSnapshot(values);
};

export const removeUnchangedAccountVisits = async (
  redis: AccountVisitBufferRedis,
  chainName: string,
  snapshot: readonly AccountVisitSnapshot[],
): Promise<number> => {
  if (snapshot.length === 0) return 0;
  const args = snapshot.flatMap((entry) => [entry.address, entry.score]);
  const removed = await redis.eval(REMOVE_UNCHANGED_VISITS_SCRIPT, 1, accountViewedKey(chainName), ...args);
  if (typeof removed !== 'number') throw new Error('Redis account visit cleanup returned a non-numeric result');
  return removed;
};
