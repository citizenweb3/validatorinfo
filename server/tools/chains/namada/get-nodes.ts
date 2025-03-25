import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';
import fetchData from '@/server/utils/fetch-data';
import isUrlValid from '@/server/utils/is-url-valid';

const { logError } = logger('namada-nodes');

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

const getNodes: GetNodesFunction = async (chain) => {
  const indexerUrl = chain.nodes.find((node) => node.type === 'indexer')?.url;
  if (!indexerUrl) {
    logError(`Indexer node for ${chain.name} chain not found`);
    return [];
  }

  try {
    const path = indexerUrl + '/api/v1/pos/validator/all';
    const nodes = await fetchData<NamadaNode[] | undefined>(path);

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
        tokens: node.votingPower,
        delegator_shares: node.votingPower,
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
