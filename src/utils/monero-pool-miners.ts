export const MINERS_STALE_HOURS = 24;

const MINERS_STALE_MS = MINERS_STALE_HOURS * 60 * 60 * 1000;

export const getFreshMinersCount = (
  minersCount: number | null | undefined,
  minersUpdatedAt: Date | null | undefined,
  referenceTime = Date.now(),
): number | null => {
  if (
    minersCount == null
    || minersUpdatedAt == null
    || !Number.isSafeInteger(minersCount)
    || minersCount <= 0
    || !Number.isFinite(referenceTime)
  ) {
    return null;
  }

  const updatedAt = minersUpdatedAt.getTime();
  const age = referenceTime - updatedAt;
  if (!Number.isFinite(updatedAt) || age < 0 || age > MINERS_STALE_MS) return null;

  return minersCount;
};
