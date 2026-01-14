export function getChunkSizeForRpcUrls(rpcUrls: string[]): number {
  const hasAlchemy = rpcUrls.some((url) => url.toLowerCase().includes('alchemy.com'));

  if (hasAlchemy) {
    return 10000;
  }
  return 10000;
}

export const MIN_CHUNK_SIZE = 1000;

export function isBlockRangeTooLargeError(error: any): boolean {
  const message = error?.message?.toLowerCase() || '';

  return (
    message.includes('range') ||
    message.includes('too large') ||
    message.includes('exceed') ||
    message.includes('limit') ||
    message.includes('block range') ||
    message.includes('10000 blocks') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    error?.code === -32005 || // Infura block range error
    error?.code === 35 // DRPC block range error
  );
}
