import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types.d';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';

const { logError } = logger('aztec-nodes');

interface AztecValidatorStats {
  address: string;
  totalSlots: number;
  lastProposal?: {
    timestamp: string;
    slot: string;
    date: string;
  };
  lastAttestation?: {
    timestamp: string;
    slot: string;
    date: string;
  };
  missedProposals: {
    currentStreak: number;
    rate?: number;
    count?: number;
    total: number;
  };
  missedAttestations: {
    currentStreak: number;
    rate?: number;
    count?: number;
    total: number;
  };
  history: Array<{
    slot: string;
    status: 'block-proposed' | 'block-mined' | 'attestation-sent' | 'attestation-missed' | 'block-missed';
  }>;
}

export interface ValidatorsStatsResponse {
  stats: {
    [address: string]: AztecValidatorStats;
  };
}

const getAztecNodes: GetNodesFunction = async (chain) => {
  try {
    const rpcUrls = chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!rpcUrls.length) {
      throw new Error('No RPC URLs provided in chain configuration');
    }

    const response = await jsonRpcClientWithFailover<ValidatorsStatsResponse>(
      rpcUrls,
      'node_getValidatorsStats',
      [],
      'aztec-nodes',
    );

    if (!response || !response.stats || typeof response.stats !== 'object') {
      logError('Invalid response structure from node_getValidatorsStats', response);
      return [];
    }

    const validators = Object.values(response.stats);

    if (!validators.length) {
      logError('No validators found in response');
      return [];
    }

    let nodes: NodeResult[] = [];

    for (const validator of validators) {
      nodes.push({
        operator_address: validator.address,
        delegator_shares: '0',
        consensus_pubkey: {
          '@type': 'aztec/AttesterAddress',
          key: validator.address,
        },
        jailed: false,
        status: 'BOND_STATUS_BONDED',
        tokens: '0',
        commission: {
          commission_rates: {
            rate: '0',
            max_rate: '0',
            max_change_rate: '0',
          },
          update_time: new Date().toISOString(),
        },
        description: {
          identity: validator.address,
          moniker: '',
          website: '',
          security_contact: '',
          details: ``,
        },
        min_self_delegation: '0',
        unbonding_height: '0',
        unbonding_time: new Date(0).toISOString(),
      });
    }
    return nodes;
  } catch (e) {
    logError(`Failed to fetch Aztec nodes`, e);
    return [];
  }
};

export default getAztecNodes;
