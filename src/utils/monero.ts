import { formatDecimal } from '@/utils/format-decimal';

export const MONERO_DECIMALS = 12;

export const formatXmrReward = (piconero: string | undefined | null, locale: string = 'en-US'): string => {
  if (piconero === null || piconero === undefined || piconero === '') return '-';
  try {
    const atomic = BigInt(piconero);
    return `${formatDecimal(Number(atomic) / 10 ** MONERO_DECIMALS, locale)} XMR`;
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
