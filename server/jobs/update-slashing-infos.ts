import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';
import {
  type AddressFieldType,
  type UptimeCalculationType,
  getSlashingConfigWithOverrides,
} from '@/server/tools/slashing-config';

const { logError, logInfo, logWarn } = logger('slashing-nodes-infos-unified');

const calculateUptime = (
  uptimeCalculation: UptimeCalculationType,
  missedBlocks: number,
  fixedWindow?: number | null,
  totalSlots?: number,
): number | null => {
  if (uptimeCalculation === 'per-validator-slots') {
    if (!totalSlots || totalSlots === 0) {
      logWarn(`Per-validator uptime calculation requires totalSlots > 0, got: ${totalSlots}. Defaulting to null.`);
      return null;
    }

    const uptime = ((totalSlots - missedBlocks) / totalSlots) * 100;
    return Math.max(0, Math.min(100, uptime));
  }

  if (!fixedWindow || fixedWindow === 0) {
    logWarn(`Fixed window uptime calculation requires blocksWindow > 0, got: ${fixedWindow}. Defaulting to null.`);
    return null;
  }

  const uptime = ((fixedWindow - missedBlocks) / fixedWindow) * 100;
  return Math.max(0, Math.min(100, uptime));
};

const buildWhereClause = (addressField: AddressFieldType, address: string) => {
  return { [addressField]: address };
};

const updateSlashingInfos = async (chainNames: string[]) => {
  logInfo(`Starting unified slashing info update for ${chainNames.length} chains`);

  let processedChains = 0;
  let skippedChains = 0;
  let totalValidatorsUpdated = 0;

  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
      include: { params: true },
    });

    if (!dbChain) {
      logError(`${chainParams.chainId} chain not found in database`);
      skippedChains++;
      continue;
    }

    if (!dbChain.hasValidators) {
      skippedChains++;
      continue;
    }

    const slashingConfig = getSlashingConfigWithOverrides(dbChain.ecosystem, chainName);

    try {
      const slashingNodesInfos = await chainMethods.getMissedBlocks(chainParams, dbChain);

      if (slashingNodesInfos.length === 0) {
        logWarn(`${chainParams.chainId}: no slashing node infos returned`);
        processedChains++;
        continue;
      }

      logInfo(
        `${chainParams.chainId}: processing ${slashingNodesInfos.length} validators (ecosystem: ${dbChain.ecosystem}, field: ${slashingConfig.addressField})`,
      );

      for (const info of slashingNodesInfos) {
        const missedBlocks = parseInt(info.missed_blocks_counter);
        const totalSlots = info.total_slots ? parseInt(info.total_slots) : undefined;

        const uptime = calculateUptime(
          slashingConfig.uptimeCalculation,
          missedBlocks,
          dbChain.params?.blocksWindow,
          totalSlots,
        );

        const whereClause = buildWhereClause(slashingConfig.addressField, info.address);

        const updateResult = await db.node.updateMany({
          where: whereClause,
          data: {
            missedBlocks,
            uptime,
          },
        });

        if (updateResult.count === 0) {
          logWarn(`${chainParams.chainId}: No node found with ${slashingConfig.addressField} = ${info.address}`);
          continue;
        }

        totalValidatorsUpdated += updateResult.count;

        if (totalSlots !== undefined && totalSlots !== null) {
          if (totalSlots > 0) {
            // Valid slots: upsert the record
            await db.nodesConsensusData.upsert({
              where: { nodeAddress: info.address },
              update: { totalSlots: totalSlots },
              create: { nodeAddress: info.address, totalSlots: totalSlots },
            });
          } else {
            await db.nodesConsensusData.deleteMany({
              where: { nodeAddress: info.address },
            });
            logInfo(`${chainParams.chainId}: Deleted consensus data for ${info.address} (totalSlots = 0)`);
          }
        }
      }

      logInfo(`${chainParams.chainId}: successfully updated ${slashingNodesInfos.length} validators`);
      processedChains++;
    } catch (e) {
      logError(`Failed to fetch slashing infos for ${chainParams.name}:`, e);
      skippedChains++;
    }
  }
  logInfo(
    `Unified slashing info update completed: ${processedChains} chains processed, ${skippedChains} skipped, ${totalValidatorsUpdated} validators updated`,
  );
};

export default updateSlashingInfos;
