import { ChainNodeType } from '@/server/tools/chains/chain-indexer';

export const mergeNodes = (
  hardcodedNodes: Array<{ type: ChainNodeType; url: string; provider?: string }>,
  registryNodes: Array<{ type: ChainNodeType; url: string; provider: string }>,
): Array<{ type: ChainNodeType; url: string; provider?: string }> => {
  const normalizeUrl = (url: string) => url.trim().toLowerCase().replace(/\/$/, '');

  const hardcodedMap = new Map<string, { type: ChainNodeType; url: string; provider?: string }>();
  hardcodedNodes.forEach((node) => {
    const key = `${normalizeUrl(node.url)}:${node.type}`;
    if (!hardcodedMap.has(key)) {
      hardcodedMap.set(key, node);
    }
  });

  const registryMap = new Map<string, string>();
  registryNodes.forEach((node) => {
    const key = `${normalizeUrl(node.url)}:${node.type}`;
    registryMap.set(key, node.provider);
  });

  const mergedNodes: Array<{ type: ChainNodeType; url: string; provider?: string }> = [];

  hardcodedMap.forEach((node, key) => {
    const registryProvider = registryMap.get(key);

    if (registryProvider) {
      registryMap.delete(key);
      mergedNodes.push({ ...node, provider: registryProvider });
    } else {
      mergedNodes.push(node);
    }
  });

  registryNodes.forEach((node) => {
    const key = `${normalizeUrl(node.url)}:${node.type}`;
    if (registryMap.has(key)) {
      mergedNodes.push(node);
    }
  });

  return mergedNodes;
};
