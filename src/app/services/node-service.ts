import { Chain, Node } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import { Validator as ParsedValidator } from '@/server/types';

const { logDebug } = logger('validator-service');

export type SortDirection = 'asc' | 'desc';

const upsertNode = async (chain: Chain, val: ParsedValidator & { validatorId?: number }): Promise<Node> => {
  const node = await db.node.upsert({
    where: { operatorAddress: val.operator_address },
    update: {
      tokens: val.tokens,
      moniker: val.description.moniker,
      delegatorShares: val.delegator_shares,
      details: val.description.details,
      website: val.description.website,
      securityContact: val.description.security_contact,
      jailed: val.jailed,
      rate: val.commission.commission_rates.rate,
      updateTime: val.commission.update_time,
    },
    create: {
      chainId: chain.id,
      validatorId: val.validatorId,
      moniker: val.description.moniker,
      operatorAddress: val.operator_address,
      consensusPubkey: val.consensus_pubkey.key,
      delegatorShares: val.delegator_shares,
      details: val.description.details,
      identity: val.description.identity,
      website: val.description.website,
      securityContact: val.description.security_contact,
      jailed: val.jailed,
      minSelfDelegation: val.min_self_delegation,
      maxRate: val.commission.commission_rates.max_rate,
      maxChangeRate: val.commission.commission_rates.max_change_rate,
      rate: val.commission.commission_rates.rate,
      updateTime: val.commission.update_time,
      tokens: val.tokens,
      unbondingHeight: val.unbonding_height,
      unbondingTime: val.unbonding_time,
    },
  });

  logDebug(`Node ${node.identity} upserted`);
  return node;
};

const ValidatorService = {
  upsertNode,
};

export default ValidatorService;
