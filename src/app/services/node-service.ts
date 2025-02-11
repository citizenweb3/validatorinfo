import { Chain, Node } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import { Validator as ParsedValidator } from '@/server/types';

const { logDebug } = logger('validator-service');

const upsertNode = async (chain: Chain, val: ParsedValidator & { validatorId?: number }): Promise<Node> => {
  let website = val.description.website || '';
  if (website) {
    website = website.startsWith('http') ? website : `https://${website}`;
  }

  const node = await db.node.upsert({
    where: { operatorAddress: val.operator_address },
    update: {
      tokens: val.tokens,
      moniker: val.description.moniker,
      delegatorShares: val.delegator_shares,
      details: val.description.details,
      securityContact: val.description.security_contact,
      jailed: val.jailed,
      rate: val.commission.commission_rates.rate,
      updateTime: val.commission.update_time,
      website,
    },
    create: {
      chain: { connect: { id: chain.id } },
      validator: val.validatorId ? { connect: { id: val.validatorId } } : undefined,
      moniker: val.description.moniker,
      operatorAddress: val.operator_address,
      consensusPubkey: val.consensus_pubkey.key,
      delegatorShares: val.delegator_shares,
      details: val.description.details,
      identity: val.description.identity,
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
      website,
    },
  });

  logDebug(`Node ${node.identity} upserted`);
  return node;
};

const nodeService = {
  upsertNode,
};

export default nodeService;
