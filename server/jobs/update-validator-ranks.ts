import db from '@/db';
import logger from '@/logger';

const { logError, logInfo } = logger('update-validator-ranks');

const updateValidatorRanks = async () => {
  try {
    logInfo('Updating validator ranks per chain');
    const chains = await db.chain.findMany({ select: { id: true, name: true } });
    let successCount = 0;
    let failureCount = 0;

    for (const chain of chains) {
      try {
        const nodes = await db.node.findMany({
          where: { chainId: chain.id, validatorId: { not: null } },
          select: { validatorId: true, delegatorShares: true, uptime: true },
        });

        if (nodes.length === 0) continue;

        const validatorMap = new Map<number, { totalShares: number; avgUptime: number | null; nodeCount: number }>();

        for (const node of nodes) {
          const vid = node.validatorId!;
          const existing = validatorMap.get(vid);
          const shares = parseFloat(node.delegatorShares || '0');

          if (existing) {
            existing.nodeCount++;
            existing.totalShares += shares;
            if (node.uptime != null) {
              existing.avgUptime =
                existing.avgUptime != null
                  ? (existing.avgUptime * (existing.nodeCount - 1) + node.uptime) / existing.nodeCount
                  : node.uptime;
            }
          } else {
            validatorMap.set(vid, {
              totalShares: shares,
              avgUptime: node.uptime,
              nodeCount: 1,
            });
          }
        }

        const validators = Array.from(validatorMap.entries()).map(([validatorId, data]) => ({
          validatorId,
          totalShares: data.totalShares,
          avgUptime: data.avgUptime,
        }));

        validators.sort((a, b) => {
          if (a.totalShares !== b.totalShares) return b.totalShares - a.totalShares;

          const aUptime = a.avgUptime ?? -1;
          const bUptime = b.avgUptime ?? -1;
          if (aUptime !== bUptime) return bUptime - aUptime;

          return a.validatorId - b.validatorId;
        });

        const batchSize = 100;
        for (let i = 0; i < validators.length; i += batchSize) {
          const batch = validators.slice(i, i + batchSize);
          await db.$transaction(
            batch.map((v, j) =>
              db.node.updateMany({
                where: { chainId: chain.id, validatorId: v.validatorId },
                data: { rank: i + j + 1 },
              }),
            ),
          );
        }

        logInfo(`Updated ranks for chain ${chain.name}: ${validators.length} validators`);
        successCount++;
      } catch (e) {
        failureCount++;
        logError(`Error updating ranks for chain ${chain.name}:`, e);
      }
    }

    logInfo(`Validator ranks update complete: ${successCount} succeeded, ${failureCount} failed`);
  } catch (e) {
    logError("Can't update validator ranks:", e);
  }
};

export default updateValidatorRanks;
