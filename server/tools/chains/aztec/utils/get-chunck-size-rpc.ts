export function getChunkSizeForRpcUrls(rpcUrls: string[]): number {
  const hasAlchemy = rpcUrls.some((url) => url.toLowerCase().includes('alchemy.com'));

  if (hasAlchemy) {
    return 10;
  }

  return 500000;
}
