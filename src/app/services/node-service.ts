import { Chain, Node } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import { NodeResult, SortDirection } from '@/server/types';

const { logDebug } = logger('validator-service');

const upsertNode = async (chain: Chain, val: NodeResult & { validatorId?: number }): Promise<Node> => {
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

const getNodesByChainId = async (chainId: number): Promise<Node[] | null> => {
  return db.node.findMany({
    where: {
      chainId: chainId,
      validatorId: { not: null },
    },
    orderBy: [{ moniker: 'asc' }],
  });
};

const getAll = async (
  ecosystems: string[],
  nodeStatus: string[],
  skip: number,
  take: number,
  sortBy: string = 'operatorAddress',
  order: SortDirection = 'asc',
): Promise<{ nodes: (Node & { chain: Chain })[]; pages: number }> => {
  logDebug(
    `Get all nodes with ecosystems: ${ecosystems}, nodeStatus: ${nodeStatus}, skip: ${skip}, take: ${take}, sortBy: ${sortBy} - ${order}`,
  );

  let chainFilter: Record<string, any> = {};
  if (ecosystems.length > 0) {
    chainFilter = { ecosystem: { in: ecosystems } };
  }

  const where: any = {};
  if (Object.keys(chainFilter).length > 0) {
    where.chain = chainFilter;
  }

  if (nodeStatus && nodeStatus.length > 0 && !nodeStatus.includes('all')) {
    const jailedSelected = nodeStatus.includes('jailed');
    const unjailedSelected = nodeStatus.includes('unjailed');
    if (jailedSelected && !unjailedSelected) {
      where.jailed = true;
    } else if (unjailedSelected && !jailedSelected) {
      where.jailed = false;
    }
  }

  const orderBy =
    sortBy === 'ecosystem'
      ? { chain: { ecosystem: order } }
      : sortBy === 'prettyName'
        ? { chain: { prettyName: order } }
        : { [sortBy]: order };

  const nodes = await db.node.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      chain: true,
    },
  });

  const count = await db.node.count({ where });
  return { nodes, pages: Math.ceil(count / take) };
};

const nodeService = {
  upsertNode,
  getNodesByChainId,
  getAll,
};

export default nodeService;
