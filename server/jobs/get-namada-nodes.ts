import db from '@/db';
import logger from '@/logger';
import nodeService from '@/services/node-service';
import validatorService from '@/services/validator-service';

import { ChainWithNodes } from '../types';

const { logError, logDebug } = logger('namada-nodes');

interface NamadaNode {
  address: string;
  votingPower: string;
  maxCommission: string;
  commission: string;
  state: 'consensus' | 'inactive' | 'belowThreshold' | 'jailed';
  name: string;
  email: string;
  website: string;
  description: string;
  discordHandle: string;
  avatar: string;
  validatorId: string;
  rank: number;
}

const getData = async (url: string): Promise<NamadaNode[] | undefined> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    logError(`Error fetching url: ${url}`, error);
  }
};

const getNamadaNodes = async (chain: ChainWithNodes) => {
  const indexerUrl = chain.chainNodes.find((node) => node.type === 'indexer')?.url;
  if (!indexerUrl) {
    logError(`Indexer node for ${chain.name} chain not found`);
    return;
  }

  const path = indexerUrl + '/api/v1/pos/validator/all';
  const validators = await getData(path);

  if (!validators) {
    logError(`No validators found for ${chain.name}`);
    return;
  }

  for (const node of validators) {
    try {
      if (!node.name) continue;

      let validator = await db.validator.findFirst({
        where: { OR: [{ securityContact: node.email }, { website: node.website }, { moniker: node.name }] },
      });

      if (!validator) {
        validator = await validatorService.upsertValidator(node.name, {
          moniker: node.name,
          details: node.description,
          website: node.website,
          securityContact: node.email,
          url: node.avatar,
        });
        logDebug(`Validator ${validator.identity} created`);
      }

      await nodeService.upsertNode(chain, {
        operator_address: node.address,
        consensus_pubkey: { '@type': '', key: '' },
        jailed: node.state === 'inactive' || node.state === 'jailed',
        status: node.state === 'inactive' || node.state === 'jailed' ? 'BOND_STATUS_UNBONDED' : 'BOND_STATUS_BONDED',
        tokens: node.votingPower,
        delegator_shares: node.votingPower,
        description: {
          identity: node.name,
          moniker: node.name,
          details: node.description,
          website: node.website,
          security_contact: node.email,
        },
        validatorId: validator.id,
        unbonding_height: '0',
        unbonding_time: new Date(0).toISOString(),
        commission: {
          commission_rates: {
            rate: node.commission,
            max_rate: node.maxCommission,
            max_change_rate: '100',
          },
          update_time: new Date().toISOString(),
        },
        min_self_delegation: '0',
      });

      logDebug(`Node ${node.name} upserted`);
    } catch (e) {
      logError(`Can't fetch namada nodes: ${path}`, e);
    }
  }
};

export default getNamadaNodes;
