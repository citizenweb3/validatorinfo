export const MINERS_STALE_HOURS = 24;

const MINERS_STALE_MS = MINERS_STALE_HOURS * 60 * 60 * 1000;

// Indexer and web hosts may drift apart (NTP); a write stamped slightly in the
// future must not read as "not fresh yet" right after the hourly job runs.
const CLOCK_SKEW_TOLERANCE_MS = 5 * 60 * 1000;

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
  if (!Number.isFinite(updatedAt) || age < -CLOCK_SKEW_TOLERANCE_MS || age > MINERS_STALE_MS) return null;

  return minersCount;
};
