import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';
import { unifyVotes } from '@/server/utils/unify-votes';

const { logError, logInfo } = logger('update-nodes-votes');

const updateNodesVotes = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
    });
    if (!dbChain) {
      logError(`${chainParams.chainId} chain not found in database`);
      continue;
    }

    if (!dbChain.hasValidators) continue;

    const nodes = await db.node.findMany({
      where: { chainId: dbChain.id },
      select: { id: true, operatorAddress: true },
    });

    for (const node of nodes) {
      const address = node.operatorAddress;
      if (!address) continue;

      const votes = await chainMethods.getNodesVotes(chainParams, address);

      if (votes.length === 0) continue;

      for (const vote of votes) {
        const proposal = await db.proposal.findFirst({
          where: { chainId: dbChain.id, proposalId: String(vote.proposalId) },
          select: { id: true },
        });
        if (!proposal) {
          logError(`${chainParams.chainId}: proposal ${vote.proposalId} not found`);
          continue;
        }

        const exists = await db.nodeVote.findFirst({
          where: { nodeId: node.id, proposalId: proposal.id },
          select: { id: true },
        });
        if (exists) continue;

        await db.nodeVote.create({
          data: {
            nodeId: node.id,
            proposalId: proposal.id,
            chainId: dbChain.id,
            vote: unifyVotes(vote.vote),
            txHash: null,
          },
        });
      }
    }
    logInfo(`${chainParams.chainId}: votes updated`);
  }
};

export default updateNodesVotes;
