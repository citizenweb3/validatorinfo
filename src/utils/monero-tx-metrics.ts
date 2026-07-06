const ZERO = BigInt(0);

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
