import db from '@/db';
import logger from '@/logger';
import {
  type CosmosDirectoryResponse,
  fetchCosmosDirectory,
  findValidatorByName,
} from '@/server/utils/cosmos-directory-fetch';
import { findNodeByProviderName } from '@/server/utils/match-names';

const { logError } = logger('match-infrastructure');

async function matchChainNodes(): Promise<void> {
  let total: number = 0;

  try {
    let cosmosDirectory: CosmosDirectoryResponse | null = null;
    try {
      cosmosDirectory = await fetchCosmosDirectory();
    } catch (e) {
      logError('Failed to fetch cosmos.directory, will only use direct matching:', e);
    }

    const unmatchedChainNodes = await db.chainNode.findMany({
      where: {
        provider: { not: null },
        nodeId: null,
      },
      include: {
        chain: true,
      },
    });

    total = unmatchedChainNodes.length;

    if (total === 0) {
      return;
    }

    for (const chainNode of unmatchedChainNodes) {
      if (!chainNode.provider) continue;

      const ecosystem = chainNode.chain.ecosystem || 'unknown';

      let matchedNodeId: number | null = null;

      try {
        const directMatch = await findNodeByProviderName(chainNode.provider, chainNode.chain.id);

        let cosmosDirectoryMatch = null;
        if (ecosystem === 'cosmos' && cosmosDirectory) {
          const cosmosValidator = findValidatorByName(chainNode.provider, cosmosDirectory);

          if (cosmosValidator) {
            const chainData = cosmosValidator.chains.find((c) => c.name === chainNode.chain.name);

            if (chainData?.address) {
              cosmosDirectoryMatch = await db.node.findFirst({
                where: {
                  chainId: chainNode.chain.id,
                  operatorAddress: chainData.address,
                },
              });
            }
          }
        }

        if (directMatch) {
          matchedNodeId = directMatch.id;
        } else if (cosmosDirectoryMatch) {
          matchedNodeId = cosmosDirectoryMatch.id;
        }

        if (matchedNodeId) {
          await db.chainNode.update({
            where: { id: chainNode.id },
            data: { nodeId: matchedNodeId },
          });
        } else {
          logError(`No match for: ${chainNode.provider} (${chainNode.chain.name}, ${ecosystem})`);
        }
      } catch (e) {
        logError(`Error processing ChainNode ${chainNode.id} (${chainNode.provider}):`, e);
      }
    }
  } catch (e) {
    logError('Fatal error in matching job:', e);
    throw e;
  }
}

export default matchChainNodes;
