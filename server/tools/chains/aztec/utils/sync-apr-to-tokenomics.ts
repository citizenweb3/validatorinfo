import db from '@/db';
import logger from '@/logger';

const { logInfo, logError } = logger('sync-aztec-apr');

export const syncAprToTokenomics = async (chainId: number, chainName: string): Promise<void> => {
  try {
    const lastRecord = await db.chainAprHistory.findFirst({
      where: { chainId },
      orderBy: { date: 'desc' },
    });

    if (!lastRecord) {
      logError(`${chainName}: No APR history records found - cannot sync to tokenomics`);
      return;
    }

    await db.tokenomics.upsert({
      where: { chainId },
      update: { apr: lastRecord.apr },
      create: { chainId, apr: lastRecord.apr },
    });

    logInfo(`${chainName}: Synced APR ${(lastRecord.apr * 100).toFixed(2)}% to tokenomics`);
  } catch (error: any) {
    logError(`${chainName}: Failed to sync APR to tokenomics: ${error.message}`);
    throw error;
  }
};
