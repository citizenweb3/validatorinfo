export interface MoneroBlockVersionCount {
  majorVersion: number;
  count: number;
}

export interface DominantMoneroVersion {
  version: number;
  sharePct: number;
}

export const reorgRate = (nonCanonicalBlocks: number, totalBlocks: number): number | null => {
  if (totalBlocks <= 0) return null;

  const boundedNonCanonical = Math.min(Math.max(nonCanonicalBlocks, 0), totalBlocks);
  return boundedNonCanonical / totalBlocks;
};

export const dominantVersion = (versionCounts: MoneroBlockVersionCount[]): DominantMoneroVersion | null => {
  const total = versionCounts.reduce((sum, row) => sum + Math.max(row.count, 0), 0);
  if (total <= 0) return null;

  let dominant: MoneroBlockVersionCount | null = null;
  for (const row of versionCounts) {
    if (row.count <= 0) continue;
    if (!dominant || row.count > dominant.count || (row.count === dominant.count && row.majorVersion > dominant.majorVersion)) {
      dominant = row;
    }
  }

  if (!dominant) return null;

  return {
    version: dominant.majorVersion,
    sharePct: (dominant.count / total) * 100,
  };
};

export const avgRewardXmr = (avgRewardAtomic: string | null, coinDecimals: number | null): number | null => {
  if (!avgRewardAtomic || coinDecimals === null || coinDecimals < 0) return null;

  try {
    const atomic = BigInt(avgRewardAtomic);
    let divisor = BigInt(1);
    for (let index = 0; index < coinDecimals; index++) {
      divisor *= BigInt(10);
    }
    const whole = atomic / divisor;
    const fraction = atomic % divisor;
    const value = Number(whole) + Number(fraction) / Number(divisor);

    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};
