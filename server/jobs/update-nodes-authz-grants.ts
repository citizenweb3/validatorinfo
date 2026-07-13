import { Prisma } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('update-nodes-authz-grants');

const updateNodesAuthzGrants = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    try {
      const chainParams = getChainParams(chainName);
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        select: { id: true, ecosystem: true, hasValidators: true },
      });

      if (!dbChain) {
        logError(`${chainParams.chainId} chain not found in database`);
        continue;
      }

      if (!dbChain.hasValidators || dbChain.ecosystem !== 'cosmos') {
        continue;
      }

      const chainMethods = getChainMethods(chainName);
      const nodes = await db.node.findMany({
        where: { chainId: dbChain.id, accountAddress: { not: null } },
        select: { id: true, accountAddress: true },
      });

      let updatedNodes = 0;

      for (const node of nodes) {
        if (!node.accountAddress) {
          continue;
        }

        const grants = await chainMethods.getNodeAuthzGrants(chainParams, node.accountAddress);
        if (grants === null) {
          continue;
        }

        await db.$transaction(async (transaction) => {
          await transaction.nodeAuthzGrant.deleteMany({ where: { nodeId: node.id } });

          if (grants.length === 0) {
            return;
          }

          await transaction.nodeAuthzGrant.createMany({
            data: grants.map((grant) => ({
              nodeId: node.id,
              chainId: dbChain.id,
              granter: grant.granter,
              grantee: grant.grantee,
              authorizationType: grant.authorizationType,
              msgTypeUrl: grant.msgTypeUrl,
              authorizationData: grant.authorizationData ?? Prisma.DbNull,
              expiration: grant.expiration ? new Date(grant.expiration) : null,
            })),
          });
        });

        updatedNodes += 1;
      }

      logInfo(`${chainParams.chainId}: authz grants updated for ${updatedNodes} nodes`);
    } catch (error) {
      logError(`${chainName}: failed to update node authz grants`, error);
    }
  }
};

export default updateNodesAuthzGrants;
