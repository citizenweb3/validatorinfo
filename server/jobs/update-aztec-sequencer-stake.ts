import db from '@/db';
import logger from '@/logger';
import getNodesForStakeFetch, { NodeStake, fetchStakesForNodes } from '@/server/tools/chains/aztec/get-node-stake';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo, logWarn } = logger('update-aztec-sequencer-stake');

const BATCH_SIZE = 50;

const updateStakesInDB = async (stakes: NodeStake[], batchNumber: number): Promise<number> => {
  if (stakes.length === 0) {
    logWarn(`Batch ${batchNumber}: No stakes to update`);
    return 0;
  }

  logInfo(`Batch ${batchNumber}: Updating ${stakes.length} nodes in database...`);

  let successCount = 0;
  let failureCount = 0;

  for (const stake of stakes) {
    try {
      const result = await db.node.updateMany({
        where: { operatorAddress: stake.operatorAddress },
        data: {
          tokens: stake.tokens,
          delegatorShares: stake.delegatorShares,
          jailed: !stake.tokens || stake.tokens === '0',
        },
      });

      if (result.count > 0) {
        successCount += result.count;
        logInfo(
          `Batch ${batchNumber}: Updated ${stake.operatorAddress} - tokens: ${stake.tokens}, delegatorShares: ${stake.delegatorShares}`,
        );
      } else {
        logWarn(`Batch ${batchNumber}: Node ${stake.operatorAddress} not found in database`);
        failureCount++;
      }
    } catch (error: any) {
      logError(`Batch ${batchNumber}: Failed to update node ${stake.operatorAddress}: ${error.message}`);
      failureCount++;
    }
  }

  logInfo(`Batch ${batchNumber}: Database update complete - ${successCount} successful, ${failureCount} failed`);

  return successCount;
};

const updateAztecSequencerStake = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    if (chainName !== 'aztec' && chainName !== 'aztec-testnet') {
      continue;
    }

    const chainParams = getChainParams(chainName);
    const jobStartTime = Date.now();

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });

      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }

      const nodesData = await getNodesForStakeFetch(chainParams, dbChain.id);

      if (!nodesData) {
        logError(`Failed to fetch nodes data for ${chainName}`);
        continue;
      }

      const { nodes, l1RpcUrls, chainName: aztecChainName, chainId } = nodesData;

      if (nodes.length === 0) {
        logError(`No nodes to update for ${chainName}`);
        continue;
      }

      const totalBatches = Math.ceil(nodes.length / BATCH_SIZE);
      logInfo(`Total nodes: ${nodes.length}, Batch size: ${BATCH_SIZE}, Total batches: ${totalBatches}`);

      let totalFetched = 0;
      let totalUpdated = 0;
      let totalFailed = 0;

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchNumber = batchIndex + 1;
        const batchStartTime = Date.now();

        const startIdx = batchIndex * BATCH_SIZE;
        const endIdx = Math.min(startIdx + BATCH_SIZE, nodes.length);
        const batchNodes = nodes.slice(startIdx, endIdx);

        try {
          const batchStakes = await fetchStakesForNodes(batchNodes, l1RpcUrls, aztecChainName, chainId, batchNumber);

          totalFetched += batchStakes.length;
          const fetchDuration = ((Date.now() - batchStartTime) / 1000).toFixed(2);
          logInfo(`Batch ${batchNumber}: Fetch completed in ${fetchDuration}s`);

          const dbStartTime = Date.now();
          const updatedCount = await updateStakesInDB(batchStakes, batchNumber);
          totalUpdated += updatedCount;

          const dbDuration = ((Date.now() - dbStartTime) / 1000).toFixed(2);
          logInfo(`Batch ${batchNumber}: Database save completed in ${dbDuration}s`);

          const batchFailed = batchNodes.length - batchStakes.length;
          totalFailed += batchFailed;

          const batchTotalDuration = ((Date.now() - batchStartTime) / 1000).toFixed(2);
          logInfo(`Batch ${batchNumber}: Total time ${batchTotalDuration}s`);
          logInfo(
            `Batch ${batchNumber}: Results - Fetched: ${batchStakes.length}/${batchNodes.length}, Updated: ${updatedCount}, Failed: ${batchFailed}`,
          );

          if (batchIndex < totalBatches - 1) {
            const delayMs = 500;
            logInfo(`Waiting ${delayMs}ms before next batch...`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        } catch (batchError: any) {
          logError(`Batch ${batchNumber}: Critical error - ${batchError.message}`);
          totalFailed += batchNodes.length;
        }
      }

      const jobDuration = ((Date.now() - jobStartTime) / 1000).toFixed(2);
      logInfo(`Total nodes processed: ${nodes.length}`);
      logInfo(`Successfully fetched: ${totalFetched} (${((totalFetched / nodes.length) * 100).toFixed(1)}%)`);
      logInfo(`Successfully updated in DB: ${totalUpdated} (${((totalUpdated / nodes.length) * 100).toFixed(1)}%)`);
      logInfo(`Failed: ${totalFailed} (${((totalFailed / nodes.length) * 100).toFixed(1)}%)`);
      logInfo(`Total execution time: ${jobDuration}s`);
      logInfo(`Average time per batch: ${(parseFloat(jobDuration) / totalBatches).toFixed(2)}s`);

      if (totalUpdated < nodes.length * 0.9) {
        logError(
          `Less than 90% success rate for ${chainName}! Only ${totalUpdated}/${nodes.length} nodes updated`,
        );
      } else {
        logInfo(`Successfully updated ${totalUpdated}/${nodes.length} nodes for ${chainName}`);
      }
    } catch (e: any) {
      logError(`Failed to update stakes for ${chainName}: ${e.message}`);
      logError(`Stack trace: ${e.stack}`);
    }
  }
};

export default updateAztecSequencerStake;
