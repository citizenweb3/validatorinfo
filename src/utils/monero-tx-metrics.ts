const ZERO = BigInt(0);

export interface RewardComposition {
  feeShare: number;
  subsidyShare: number;
}

export const tps = (totalTx: number, windowSeconds: number): number | null => {
  if (windowSeconds <= 0 || totalTx < 0) return null;
  return totalTx / windowSeconds;
};

export const avgFeeAtomic = (
  sumRewardAtomic: bigint,
  subsidyAtomic: bigint,
  blockCount: number,
  totalTx: number,
): bigint | null => {
  if (blockCount <= 0 || totalTx <= 0) return null;

  const totalSubsidy = subsidyAtomic * BigInt(blockCount);
  const totalFees = sumRewardAtomic > totalSubsidy ? sumRewardAtomic - totalSubsidy : ZERO;

  return totalFees / BigInt(totalTx);
};

export const rewardComposition = (
  sumRewardAtomic: bigint,
  subsidyAtomic: bigint,
  blockCount: number,
): RewardComposition | null => {
  if (!Number.isSafeInteger(blockCount) || blockCount <= 0 || sumRewardAtomic <= ZERO || subsidyAtomic < ZERO) {
    return null;
  }

  const totalSubsidy = subsidyAtomic * BigInt(blockCount);
  const totalFees = sumRewardAtomic > totalSubsidy ? sumRewardAtomic - totalSubsidy : ZERO;
  const feeShare = Number(totalFees) / Number(sumRewardAtomic);

  if (!Number.isFinite(feeShare)) return null;

  return { feeShare, subsidyShare: 1 - feeShare };
};
