import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';
import { NodeResult } from '@/server/types';
import { bigIntPow } from '@/server/utils/bigint-pow';
import isUrlValid from '@/server/utils/is-url-valid';

const { logError } = logger('namada-nodes');

export interface NamadaNode {
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

const getNodes: GetNodesFunction = async (chain) => {
  try {
    const nodes = await fetchChainData<NamadaNode[] | undefined>(chain.name, 'indexer', '/api/v1/pos/validator/all');

    if (!nodes) {
      logError(`No nodes found for ${chain.name}`);
      return [];
    }

    const result: NodeResult[] = [];

    for (const node of nodes) {
      if (!node.name) continue;

      let website = node.website ?? '';
      if (website) {
        website = node.website.indexOf('http') === 0 ? node.website : `https://${node.website}`;
        website = isUrlValid(website) ? website : '';
      }

      result.push({
        operator_address: node.address,
        consensus_pubkey: { '@type': '', key: '' },
        jailed: node.state === 'inactive' || node.state === 'jailed',
        status: node.state === 'inactive' || node.state === 'jailed' ? 'BOND_STATUS_UNBONDED' : 'BOND_STATUS_BONDED',
        tokens: String(BigInt(node.votingPower) * bigIntPow(BigInt(10), BigInt(chain.coinDecimals))),
        delegator_shares: String(BigInt(node.votingPower) * bigIntPow(BigInt(10), BigInt(chain.coinDecimals))),
        description: {
          identity: '',
          moniker: node.name,
          details: node.description ?? '',
          website,
          security_contact: node.email,
        },
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
    }

    return result;
  } catch (e) {
    logError(`Can't fetch namada nodes`, e);
    return [];
  }
};

export default getNodes;
