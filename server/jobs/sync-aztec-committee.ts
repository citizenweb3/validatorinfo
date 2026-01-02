import { getAddress } from 'viem';
import Redis from 'ioredis';

import db from '@/db';
import logger from '@/logger';
import getCurrentEpoch from '@/server/tools/chains/aztec/utils/get-current-epoch';
import getCurrentEpochCommittee from '@/server/tools/chains/aztec/utils/get-current-epoch-committee';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('sync-aztec-committee');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: redisPort,
});

const syncAztecCommittee = async () => {
  logInfo('Starting Aztec committee sync');

  for (const chainName of AZTEC_CHAINS) {
    try {
      const chainParams = getChainParams(chainName);

      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });

      if (!dbChain) {
        logInfo(`Chain ${chainName} not found in database, skipping`);
        continue;
      }

      const currentEpoch = await getCurrentEpoch(chainName);
      if (currentEpoch === null) {
        logError(`${chainName}: Could not fetch current epoch`);
        continue;
      }

      const currentEpochStr = String(currentEpoch);

      const cacheKey = `aztec:${chainName}:committee-epoch`;
      const cachedEpoch = await redis.get(cacheKey);

      if (cachedEpoch === currentEpochStr) {
        logInfo(`${chainName}: Epoch ${currentEpochStr} unchanged, skipping committee sync`);
        continue;
      }

      logInfo(`${chainName}: Syncing committee for epoch ${currentEpochStr}`);

      const committee = await getCurrentEpochCommittee(chainName);
      if (committee === null) {
        logError(`${chainName}: Could not fetch committee`);
        continue;
      }

      logInfo(`${chainName}: Found ${committee.length} committee members`);

      // Normalize addresses with getAddress() (checksum format)
      const committeeAddresses = committee.map((addr) => getAddress(addr));

      await db.$transaction(async (tx) => {
        await tx.node.updateMany({
          where: {
            chainId: dbChain.id,
            inCommittee: true,
          },
          data: {
            inCommittee: false,
          },
        });

        if (committeeAddresses.length > 0) {
          const result = await tx.node.updateMany({
            where: {
              chainId: dbChain.id,
              operatorAddress: { in: committeeAddresses },
            },
            data: {
              inCommittee: true,
              committeeEpoch: BigInt(currentEpoch),
            },
          });

          logInfo(`${chainName}: Updated ${result.count} nodes as committee members`);
        }
      });

      await redis.set(cacheKey, currentEpochStr);

      logInfo(`${chainName}: Committee sync complete for epoch ${currentEpochStr}`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec committee sync completed');
};

export default syncAztecCommittee;
