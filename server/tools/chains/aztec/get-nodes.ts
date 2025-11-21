import logger from '@/logger';
import { getNodeStake } from '@/server/tools/chains/aztec/utils/get-node-stake';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { getChainParams } from '@/server/tools/chains/params';
import { NodeResult } from '@/server/types.d';
import { jsonRpcClientWithFailover } from '@/server/utils/json-rpc-client';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config'

const { logError, logWarn } = logger('aztec-nodes');

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
    const aztecRpcUrls = chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!aztecRpcUrls.length) {
      throw new Error('No L2 RPC URLs provided in chain configuration');
    }

    const l1Chain = getChainParams(getL1[chain.name]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      logError('No L1 RPC URLs found - stake data will not be available');
    }

    const response = await jsonRpcClientWithFailover<ValidatorsStatsResponse>(
      aztecRpcUrls,
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
      let nodeStake: bigint | null = null;

      if (l1RpcUrls.length > 0) {
        try {
          nodeStake = await getNodeStake(validator.address, l1RpcUrls, chain.name as 'aztec' | 'aztec-testnet');
        } catch (e: any) {
          logWarn(`Failed to fetch stake for validator ${validator.address}: ${e.message}`);
        }
      }

      nodes.push({
        operator_address: validator.address,
        delegator_shares: nodeStake !== null ? String(nodeStake) : '',
        consensus_pubkey: {
          '@type': 'aztec/AttesterAddress',
          key: validator.address,
        },
        jailed: false,
        status: 'BOND_STATUS_BONDED',
        tokens: nodeStake !== null ? String(nodeStake) : '',
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
