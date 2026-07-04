export interface PoolShareInput {
  sharePercent: number | null;
  pool: {
    slug: string;
  };
}

export interface HashrateSnapshotInput {
  snapshotAt: Date;
  height: number;
  difficulty: string;
}

export interface NakamotoCoefficient {
  count: number | null;
  isLowerBound: boolean;
  cumulativeShare: number;
}

export interface HhiResult {
  value: number | null;
}

export interface BlockTimeStats {
  averageSeconds: number | null;
  coefficientOfVariation: number | null;
  sampleCount: number;
}

export interface DifficultyStability {
  coefficientOfVariation: number | null;
  sampleCount: number;
}

const UNKNOWN_POOL_SLUG = 'unknown';
const NETWORK_MAJORITY_PERCENT = 50;
const BIGINT_ZERO = BigInt(0);
const BIGINT_ONE = BigInt(1);
const BIGINT_TWO = BigInt(2);
const BIGINT_SCALE = BigInt(1_000_000);

const isPositiveFinite = (value: number): boolean => Number.isFinite(value) && value > 0;

export const realPoolShares = (poolStats: PoolShareInput[]): number[] => {
  return poolStats
    .filter((stat) => stat.pool.slug !== UNKNOWN_POOL_SLUG)
    .map((stat) => stat.sharePercent ?? 0)
    .filter(isPositiveFinite)
    .sort((a, b) => b - a);
};

export const realPoolCount = (poolStats: PoolShareInput[]): number => {
  return poolStats.filter((stat) => stat.pool.slug !== UNKNOWN_POOL_SLUG).length;
};

export const nakamotoCoefficient = (poolStats: PoolShareInput[]): NakamotoCoefficient => {
  const shares = realPoolShares(poolStats);
  if (shares.length === 0) return { count: null, isLowerBound: false, cumulativeShare: 0 };

  let cumulativeShare = 0;
  for (let index = 0; index < shares.length; index += 1) {
    cumulativeShare += shares[index];
    if (cumulativeShare > NETWORK_MAJORITY_PERCENT) {
      return { count: index + 1, isLowerBound: false, cumulativeShare };
    }
  }

  return { count: shares.length, isLowerBound: true, cumulativeShare };
};

export const hhi = (poolStats: PoolShareInput[]): HhiResult => {
  const shares = realPoolShares(poolStats);
  if (shares.length === 0) return { value: null };

  // Unknown/solo represents many independent miners, not one coordinated pool; exclude it from HHI.
  return { value: shares.reduce((sum, share) => sum + share * share, 0) };
};

const mean = (values: number[]): number | null => {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const coefficientOfVariation = (values: number[]): number | null => {
  const average = mean(values);
  if (!average || average <= 0) return null;

  const variance = values.reduce((sum, value) => sum + (value - average) ** 2, 0) / values.length;
  return Math.sqrt(variance) / average;
};

export const blockTimeStats = (snapshots: HashrateSnapshotInput[]): BlockTimeStats => {
  if (snapshots.length < 2) return { averageSeconds: null, coefficientOfVariation: null, sampleCount: snapshots.length };

  const intervals: number[] = [];
  for (let index = 1; index < snapshots.length; index += 1) {
    const previous = snapshots[index - 1];
    const current = snapshots[index];
    const heightDelta = current.height - previous.height;
    const secondsDelta = (current.snapshotAt.getTime() - previous.snapshotAt.getTime()) / 1000;

    if (heightDelta <= 0 || secondsDelta <= 0) continue;
    intervals.push(secondsDelta / heightDelta);
  }

  return {
    averageSeconds: mean(intervals),
    coefficientOfVariation: coefficientOfVariation(intervals),
    sampleCount: intervals.length,
  };
};

const integerSqrt = (value: bigint): bigint => {
  if (value < BIGINT_ZERO) throw new Error('Cannot compute square root of a negative bigint');
  if (value < BIGINT_TWO) return value;

  let low = BIGINT_ONE;
  let high = value;
  let answer = BIGINT_ONE;

  while (low <= high) {
    const mid = (low + high) / BIGINT_TWO;
    const square = mid * mid;

    if (square === value) return mid;
    if (square < value) {
      answer = mid;
      low = mid + BIGINT_ONE;
      continue;
    }
    high = mid - BIGINT_ONE;
  }

  return answer;
};

export const difficultyStability = (snapshots: HashrateSnapshotInput[]): DifficultyStability => {
  const values = snapshots
    .map((snapshot) => {
      try {
        return BigInt(snapshot.difficulty);
      } catch {
        return null;
      }
    })
    .filter((value): value is bigint => value !== null && value > BIGINT_ZERO);

  if (values.length < 2) return { coefficientOfVariation: null, sampleCount: values.length };

  const sum = values.reduce((total, value) => total + value, BIGINT_ZERO);
  const average = sum / BigInt(values.length);
  if (average <= BIGINT_ZERO) return { coefficientOfVariation: null, sampleCount: values.length };

  const variance = values.reduce((total, value) => {
    const relative = (value * BIGINT_SCALE) / average;
    const diff = relative - BIGINT_SCALE;
    return total + diff * diff;
  }, BIGINT_ZERO) / BigInt(values.length);

  const cvScaled = integerSqrt(variance);
  return {
    coefficientOfVariation: Number(cvScaled) / Number(BIGINT_SCALE),
    sampleCount: values.length,
  };
};
