export const MONERO_DECIMALS = 12;

export const formatXmrReward = (piconero: string | undefined | null): string => {
  if (!piconero) return '-';
  try {
    const big = BigInt(piconero);
    const divisor = BigInt(10 ** MONERO_DECIMALS);
    const whole = big / divisor;
    const fraction = big % divisor;
    const fractionStr = fraction.toString().padStart(MONERO_DECIMALS, '0').slice(0, 4);
    return `${whole.toString()}.${fractionStr} XMR`;
  } catch {
    return '-';
  }
};

export const formatBytes = (bytes: number | null | undefined): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const formatRelativeTimeFromUnix = (unixSeconds: number): string => {
  const diffSec = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds);
  if (diffSec < 60) return `${diffSec}s ago`;
  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
