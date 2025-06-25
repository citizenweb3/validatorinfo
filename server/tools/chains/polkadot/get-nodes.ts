import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';
import fetchChainData from '@/server/tools/get-chain-data';
import db from '@/db';

import { Node as DbNode } from '@prisma/client';

const { logError, logInfo } = logger('polkadot-nodes');

const mapDb = (n: DbNode, bonded: boolean): NodeResult => ({
  operator_address: n.operatorAddress,
  delegator_shares: n.delegatorShares,
  consensus_pubkey: { '@type': '', key: n.consensusPubkey },
  jailed: n.jailed,
  min_self_delegation: n.minSelfDelegation,
  unbonding_height: n.unbondingHeight,
  unbonding_time: n.unbondingTime.toISOString(),
  tokens: n.tokens,
  status: bonded ? 'BOND_STATUS_BONDED' : 'BOND_STATUS_UNBONDED',
  commission: {
    commission_rates: {
      rate: n.rate,
      max_rate: n.maxRate,
      max_change_rate: n.maxChangeRate,
    },
    update_time: n.updateTime.toISOString(),
  },
  description: {
    identity: n.identity,
    moniker: n.moniker,
    website: n.website,
    security_contact: n.securityContact,
    details: n.details,
  },
});

const getNodes: GetNodesFunction = async (chain) => {

  const dbNodes = await db.node.findMany({ where: { chain: { name: chain.name } } });
  const dbMap = new Map(dbNodes.map((n) => [n.operatorAddress, n]));
  const results: NodeResult[] = [];

  let validators;
  try {
    validators = (await fetchChainData<any>(
      chain.name,
      'rest',
      `/pallets/staking/storage/validators`,
    ))?.value;
    logInfo(`Fetched validators: ${JSON.stringify(validators)}`);
  } catch (e) {
    logError('validators list fetch failed', e);
    return dbNodes.map((n) => mapDb(n, !n.jailed));
  }

  for (const address of validators) {
    logInfo(`Processing validator: ${address}`);
    const dbNode = dbMap.get(address);
    const bonded = true;

    const node: NodeResult = dbNode ? mapDb(dbNode, bonded) : {
      operator_address: address,
      delegator_shares: '',
      consensus_pubkey: { '@type': '', key: '' },
      jailed: false,
      min_self_delegation: '0',
      unbonding_height: '0',
      unbonding_time: new Date(0).toISOString(),
      tokens: '',
      status: 'BOND_STATUS_BONDED',
      commission: {
        commission_rates: { rate: '0', max_rate: '0', max_change_rate: '0' },
        update_time: new Date().toISOString(),
      },
      description: { identity: '', moniker: '', website: '', security_contact: '', details: '' },
    };

    results.push(node);
  }

  return results;
};

export default getNodes;
