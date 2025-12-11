import db from '@/db';
import logger from '@/logger';
import { AztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';

const { logError } = logger('get-tvs-aztec');

export const getBondedTokens = async (chainName: AztecChainName): Promise<bigint> => {
  try {
    const dbChain = await db.chain.findUnique({
      where: { chainId: chainName },
    });

    if (!dbChain) {
      throw new Error(`Failed to get dbChain for ${chainName}`);
    }

    const nodes = await db.node.findMany({
      where: { chainId: dbChain.id },
    });

    let bondedTokens = BigInt(0);

    for (const node of nodes) {
      try {
        if (node.delegatorShares) {
          bondedTokens += BigInt(node.delegatorShares);
        }
      } catch (e: any) {
        logError(
          `Invalid token value for node ${node.operatorAddress}: delegatorShares=${node.delegatorShares}`,
        );
      }
    }

    return bondedTokens;
  } catch (e: any) {
    throw new Error(`Failed to fetch bonded tokens: ${e.message}`);
  }
};
