import db from '@/db';
import logger from '@/logger';
import { GetUnbondingTokens } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError, logInfo } = logger('get-unbonding-tokens');

interface UnbondingDelegation {
  delegator_address: string;
  validator_address: string;
  entries: Array<{
    creation_height: string;
    completion_time: string;
    initial_balance: string;
    balance: string;
  }>;
}

interface UnbondingDelegationsResponse {
  unbonding_responses: UnbondingDelegation[];
  pagination?: {
    next_key: string | null;
    total: string;
  };
}

const getUnbondingTokens: GetUnbondingTokens = async (chain) => {
  try {
    const dbChain = await db.chain.findFirst({
      where: { chainId: chain.chainId },
      include: {
        nodes: {
          select: {
            operatorAddress: true,
          },
        },
      },
    });

    if (!dbChain || !dbChain.nodes || dbChain.nodes.length === 0) {
      logError(`No validators found for ${chain.name}`);
      return null;
    }

    let totalUnbonding = BigInt(0);
    let validatorCount = 0;
    let errorCount = 0;

    for (const node of dbChain.nodes) {
      try {
        const unbondingData = await fetchChainData<UnbondingDelegationsResponse>(
          chain.name,
          'rest',
          `/cosmos/staking/v1beta1/validators/${node.operatorAddress}/unbonding_delegations`,
        );

        if (unbondingData?.unbonding_responses) {
          for (const unbonding of unbondingData.unbonding_responses) {
            for (const entry of unbonding.entries) {
              totalUnbonding += BigInt(entry.balance);
            }
          }
          validatorCount++;
        }
      } catch (e) {
        errorCount++;
        if (errorCount <= 3) {
          logError(`Could not fetch unbonding delegations for validator ${node.operatorAddress}: ${e}`);
        }
      }
    }

    return totalUnbonding.toString();
  } catch (error: any) {
    logError(`Error fetching unbonding tokens for ${chain.name}:`, error);
    return null;
  }
};

export default getUnbondingTokens;
