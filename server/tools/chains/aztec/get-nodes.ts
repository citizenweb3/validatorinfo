import { getAddress } from 'viem';

import db from '@/db';
import logger from '@/logger';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { fetchProviderMetadata } from '@/server/tools/chains/aztec/utils/fetch-provider-metadata';
import { getActiveSequencers } from '@/server/tools/chains/aztec/utils/get-active-sequencers';
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

const createSelfStakedNode = (attester: string, withdrawer: string): NodeResult => ({
  operator_address: getAddress(attester),
  account_address: getAddress(withdrawer),
  reward_address: getAddress(withdrawer),
  delegator_shares: '0',
  tokens: '0',
  consensus_pubkey: {
    '@type': 'aztec/AttesterAddress',
    key: getAddress(attester),
  },
  jailed: false,
  status: 'BOND_STATUS_BONDED',
  commission: {
    commission_rates: {
      rate: '0',
      max_rate: '1',
      max_change_rate: '0.01',
    },
    update_time: new Date().toISOString(),
  },
  description: {
    identity: getAddress(attester),
    moniker: `Sequencer ${attester.slice(0, 10)}...${attester.slice(-6)}`,
    website: '',
    security_contact: '',
    details: 'Self-staked sequencer',
  },
  min_self_delegation: '0',
  unbonding_height: '0',
  unbonding_time: new Date(0).toISOString(),
});

const getAztecNodes: GetNodesFunction = async (chain) => {
  const chainName = chain.name as 'aztec' | 'aztec-testnet';

  const l1Chain = getChainParams(getL1[chainName]);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  if (!l1RpcUrls.length) {
    throw new Error(`${chainName}: No L1 RPC URLs found - cannot fetch sequencer data`);
  }

  const dbChain = await db.chain.findFirst({
    where: { chainId: chain.chainId },
  });

  if (!dbChain) {
    throw new Error(`${chainName}: Chain not found in database`);
  }

  logInfo(`Fetching sequencers for ${chainName}`);

  const activeSequencers = await getActiveSequencers(dbChain.id);

  logInfo(`Found ${activeSequencers.size} active sequencers`);

  if (activeSequencers.size === 0) {
    logWarn(`${chainName}: No active sequencers found - this may indicate data sync issue`);
    return [];
  }

  let providers: Map<bigint, any>;
  let attesterToProvider: Map<string, bigint>;
  let providerMetadata: Map<string, any>;

  try {
    [providers, attesterToProvider, providerMetadata] = await Promise.all([
      getProviders(l1RpcUrls, chainName),
      getProviderAttesters(l1RpcUrls, chainName),
      fetchProviderMetadata(),
    ]);
  } catch (e: any) {
    throw new Error(`${chainName}: Failed to fetch provider data: ${e.message}`);
  }

  logInfo(`Found ${providers.size} providers and ${attesterToProvider.size} attester-to-provider mappings`);

  const nodes: NodeResult[] = [];
  let delegatedCount = 0;
  let selfStakedCount = 0;
  let errorCount = 0;

  for (const [attester, withdrawer] of Array.from(activeSequencers.entries())) {
    try {
      const providerId = attesterToProvider.get(attester);

      if (providerId) {
        const provider = providers.get(providerId);

        if (!provider) {
          logWarn(`Provider ${providerId} not found for attester ${attester}, treating as self-staked`);
          nodes.push(createSelfStakedNode(attester, withdrawer));
          selfStakedCount++;
          continue;
        }

        const metadata = chainName === 'aztec' ? providerMetadata.get(getAddress(provider.providerAdmin)) : undefined;
        const moniker = metadata?.name || `Provider ${providerId}`;
        const website = metadata?.website || '';
        const details = metadata?.description || '';

        nodes.push({
          operator_address: getAddress(attester),
          account_address: getAddress(provider.providerAdmin),
          reward_address: getAddress(provider.providerRewardsRecipient),
          delegator_shares: '0',
          tokens: '0',
          consensus_pubkey: {
            '@type': 'aztec/AttesterAddress',
            key: getAddress(attester),
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

        delegatedCount++;
      } else {
        nodes.push(createSelfStakedNode(attester, withdrawer));
        selfStakedCount++;
      }
    } catch (e: any) {
      logError(`Error processing attester ${attester}: ${e.message}`);
      errorCount++;
    }
  }

  logInfo(
    `Created ${nodes.length} nodes: ${delegatedCount} delegated, ${selfStakedCount} self-staked` +
    (errorCount > 0 ? `, ${errorCount} errors` : '')
  );

  if (activeSequencers.size > 0 && nodes.length === 0) {
    throw new Error(`${chainName}: All ${activeSequencers.size} sequencers failed to process`);
  }

  return nodes;
};

export default getAztecNodes;
