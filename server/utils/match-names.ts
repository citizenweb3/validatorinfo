import db from '@/db';
import { normalizeName } from '@/server/utils/normalize-node-name';

import { Node } from '.prisma/client';

const MATCH_THRESHOLD = 0.8;

export function calculateSimilarity(name1: string | null | undefined, name2: string | null | undefined): number {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  if (!norm1 || !norm2) return 0.0;
  if (norm1 === norm2) return 1.0;
  if (norm1.length > 0 && norm2.length > 0) {
    if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.8;
  }

  return 0.0;
}

export async function findNodeByProviderName(
  providerName: string | null | undefined,
  chainId: number,
): Promise<Node | null> {
  if (!providerName) return null;

  let node = await db.node.findFirst({
    where: {
      chainId: chainId,
      moniker: providerName,
    },
  });

  if (node) return node;

  node = await db.node.findFirst({
    where: {
      chainId: chainId,
      moniker: {
        equals: providerName,
        mode: 'insensitive',
      },
    },
  });

  if (node) return node;

  const allNodes = await db.node.findMany({
    where: { chainId: chainId },
    select: { id: true, moniker: true },
  });

  let bestMatch: { id: number; score: number } | null = null;

  for (const n of allNodes) {
    const similarity = calculateSimilarity(n.moniker, providerName);

    if (similarity > MATCH_THRESHOLD && (!bestMatch || similarity > bestMatch.score)) {
      bestMatch = { id: n.id, score: similarity };
    }
  }

  if (bestMatch) {
    return await db.node.findUnique({ where: { id: bestMatch.id } });
  }

  return null;
}
