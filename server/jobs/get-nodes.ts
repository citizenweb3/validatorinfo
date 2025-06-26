import db from '@/db';
import logger from '@/logger';
import { isIdentityValid } from '@/server/jobs/update-validators-by-keybase';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';
import nodeService from '@/services/node-service';
import validatorService from '@/services/validator-service';

const { logError } = logger('get-nodes');

const getNodes = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
      include: { params: true }
    });
    if (!dbChain) {
      logError(`${chainParams.chainId} chain not found in database`);
      continue;
    }

    if (dbChain.hasValidators) {
      try {
        const nodes = await chainMethods.getNodes(chainParams);

        logError(`${chainParams.chainId} chain ${JSON.stringify(nodes)}`);

        for (const node of nodes) {
          let validatorId: number | undefined;
          if (isIdentityValid(node.description.identity)) {
            let validator = await db.validator.findFirst({
              where: { identity: node.description.identity },
            });

            if (!validator) {
              validator = await validatorService.upsertValidator(node.description.identity, {
                moniker: node.description.moniker,
                website: node.description.website,
                securityContact: node.description.security_contact,
                details: node.description.details,
              });
            }
            validatorId = validator.id;
          } else {
            const orWhere = [];
            if (node.description.security_contact) {
              orWhere.push({ securityContact: node.description.security_contact });
            }
            if (node.description.website) {
              orWhere.push({ website: node.description.website });
            }
            if (node.description.moniker) {
              orWhere.push({ moniker: node.description.moniker });
            }
            if (orWhere.length > 0) {
              let validator = await db.validator.findFirst({
                where: {
                  OR: orWhere,
                },
              });
              validatorId = validator?.id;
            }
          }

          const bech32Prefix = dbChain.ecosystem === 'cosmos'
            ? dbChain?.params?.bech32Prefix
            : undefined;

          await nodeService.upsertNode(dbChain, bech32Prefix, { ...node, validatorId: validatorId });
        }
      } catch (e) {
        logError(`Can't fetch nodes for ${chainParams.name}:`, e);
      }
    }
  }
};
export default getNodes;
