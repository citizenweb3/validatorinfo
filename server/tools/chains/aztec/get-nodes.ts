import { getAddress } from 'viem';

import logger from '@/logger';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { fetchProviderMetadata } from '@/server/tools/chains/aztec/utils/fetch-provider-metadata';
import { getProviderAttesters } from '@/server/tools/chains/aztec/utils/get-provider-attesters';
import { getProviders } from '@/server/tools/chains/aztec/utils/get-providers';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { getChainParams } from '@/server/tools/chains/params';
import { NodeResult } from '@/server/types.d';

const { logInfo, logError, logWarn } = logger('aztec-nodes');

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
    const chainName = chain.name as 'aztec' | 'aztec-testnet';

    const l1Chain = getChainParams(getL1[chainName]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      throw new Error('No L1 RPC URLs found - cannot fetch providers');
    }

    logInfo(`Fetching providers and attesters for ${chainName}`);

    const [providers, attesterToProvider, providerMetadata] = await Promise.all([
      getProviders(l1RpcUrls, chainName),
      getProviderAttesters(l1RpcUrls, chainName),
      fetchProviderMetadata(),
    ]);

    logInfo(`Found ${providers.size} providers and ${attesterToProvider.size} attesters`);

    if (providers.size === 0) {
      logError('No providers found from L1 contract');
      return [];
    }

    if (attesterToProvider.size === 0) {
      logWarn('No attester mappings found from L1 events');
      return [];
    }

    const nodes: NodeResult[] = [];
    const attesterEntries = Array.from(attesterToProvider.entries());

    for (const [attesterAddress, providerId] of attesterEntries) {
      try {
        const provider = providers.get(providerId);
        if (!provider) {
          logWarn(`Provider ${providerId} not found for attester ${attesterAddress}`);
          continue;
        }

        const metadata = chainName === 'aztec' ? providerMetadata.get(getAddress(provider.providerAdmin)) : undefined;

        const moniker = metadata?.name || `Provider ${providerId}`;
        const website = metadata?.website || '';
        const details = metadata?.description || '';

        nodes.push({
          operator_address: getAddress(attesterAddress),
          account_address: getAddress(provider.providerAdmin),
          reward_address: getAddress(provider.providerRewardsRecipient),
          delegator_shares: '0',
          tokens: '0',
          consensus_pubkey: {
            '@type': 'aztec/AttesterAddress',
            key: getAddress(attesterAddress),
          },
          jailed: false,
          status: 'BOND_STATUS_BONDED',
          commission: {
            commission_rates: {
              rate: String(provider.providerTakeRate / 10000),
              max_rate: '1',
              max_change_rate: '0.01',
            },
            update_time: new Date().toISOString(),
          },
          description: {
            identity: getAddress(provider.providerAdmin),
            moniker: moniker,
            website: website,
            security_contact: '',
            details: details,
          },
          min_self_delegation: '0',
          unbonding_height: '0',
          unbonding_time: new Date(0).toISOString(),
        });
      } catch (e: any) {
        logError(`Error processing attester ${attesterAddress}: ${e.message}`);
      }
    }

    logInfo(`Created ${nodes.length} nodes from attesters`);

    return nodes;
  } catch (e) {
    logError(`Failed to fetch Aztec nodes`, e);
    return [];
  }
};

export default getAztecNodes;
