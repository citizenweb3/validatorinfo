import { getAddress } from 'viem';

import db from '@/db';
import logger from '@/logger';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getNodeStake } from '@/server/tools/chains/aztec/utils/get-node-stake';
import { getProviderAttesters } from '@/server/tools/chains/aztec/utils/get-provider-attesters';
import { getProviders } from '@/server/tools/chains/aztec/utils/get-providers';
import providersMonikersData from '@/server/tools/chains/aztec/utils/providers_monikers.json';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { getChainParams } from '@/server/tools/chains/params';
import { NodeResult } from '@/server/types.d';

const { logInfo, logError, logWarn } = logger('aztec-nodes');

const AZTEC_PROVIDERS_API = 'https://d10cun7h2qqnvc.cloudfront.net/api/providers';

// Types for RPC response (used by get-missed-blocks.ts)
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

interface AztecProviderApiResponse {
  providers: Array<{
    id: string;
    name: string;
    commission: number;
    delegators: number;
    currentStake: string;
    totalStaked: string;
    address: string;
    description: string;
    website: string;
    logo_url: string;
    email: string;
    discord: string;
  }>;
}

/**
 * Fetch provider metadata from API with fallback to local JSON file
 * Maps provider admin addresses to their display information
 */
async function fetchProviderMetadata(): Promise<Map<string, { name: string; website: string; description: string }>> {
  try {
    logInfo('Attempting to fetch provider metadata from API');

    const response = await fetch(AZTEC_PROVIDERS_API, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Host': 'd10cun7h2qqnvc.cloudfront.net',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0',
      },
    });

    if (!response.ok) {
      logWarn(`Failed to fetch provider metadata from API: ${response.statusText}, falling back to local JSON`);
      return loadProviderMetadataFromFile();
    }

    const data: AztecProviderApiResponse = await response.json();
    const providerMetadata = new Map<string, { name: string; website: string; description: string }>();

    for (const provider of data.providers) {
      const checksummedAddress = getAddress(provider.address);
      providerMetadata.set(checksummedAddress, {
        name: provider.name,
        website: provider.website || '',
        description: provider.description || '',
      });
    }

    logInfo(`Fetched ${providerMetadata.size} provider metadata entries from API`);
    return providerMetadata;
  } catch (e: any) {
    logWarn(`Error fetching provider metadata from API: ${e.message}, falling back to local JSON`);
    return loadProviderMetadataFromFile();
  }
}

/**
 * Load provider metadata from local JSON file (fallback)
 * Maps provider admin addresses to their display information
 */
function loadProviderMetadataFromFile(): Map<string, { name: string; website: string; description: string }> {
  try {
    const data = providersMonikersData as AztecProviderApiResponse;
    const providerMetadata = new Map<string, { name: string; website: string; description: string }>();

    for (const provider of data.providers) {
      const checksummedAddress = getAddress(provider.address);
      providerMetadata.set(checksummedAddress, {
        name: provider.name,
        website: provider.website || '',
        description: provider.description || '',
      });
    }

    logInfo(`Loaded ${providerMetadata.size} provider metadata entries from local JSON file`);
    return providerMetadata;
  } catch (e: any) {
    logError(`Error loading provider metadata from local JSON file: ${e.message}`);
    return new Map();
  }
}

/**
 * Fetches ALL Aztec nodes from providers and their attesters
 * This includes both active and inactive nodes
 *
 * Approach:
 * 1. Fetch all providers from L1 StakingRegistry contract
 * 2. Fetch attester-to-provider mappings from L1 events
 * 3. Load provider metadata (names, websites, descriptions)
 * 4. Create nodes for ALL attesters with complete metadata
 * 5. Mark removed attesters (no longer mapped to providers) as jailed
 */
const getAztecNodes: GetNodesFunction = async (chain) => {
  try {
    const chainName = chain.name as 'aztec' | 'aztec-testnet';

    // Get L1 RPC URLs for contract calls
    const l1Chain = getChainParams(getL1[chainName]);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls.length) {
      throw new Error('No L1 RPC URLs found - cannot fetch providers');
    }

    logInfo(`Fetching providers and attesters for ${chainName}`);

    // Fetch providers, attester mappings, and metadata in parallel
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

    // Create nodes from ALL attesters
    const nodes: NodeResult[] = [];
    const attesterEntries = Array.from(attesterToProvider.entries());

    for (const [attesterAddress, providerId] of attesterEntries) {
      try {
        // Get provider configuration
        const provider = providers.get(providerId);
        if (!provider) {
          logWarn(`Provider ${providerId} not found for attester ${attesterAddress}`);
          continue;
        }

        // Get provider metadata (only for aztec mainnet, testnet uses generic names)
        const metadata = chainName === 'aztec'
          ? providerMetadata.get(getAddress(provider.providerAdmin))
          : undefined;

        const moniker = metadata?.name || `Provider ${providerId}`;
        const website = metadata?.website || '';
        const details = metadata?.description || '';

        // Fetch stake for this attester from L1
        let nodeStake: bigint | null = null;
        try {
          nodeStake = await getNodeStake(attesterAddress, l1RpcUrls, chainName);
        } catch (e: any) {
          logWarn(`Failed to fetch stake for attester ${attesterAddress}: ${e.message}`);
        }

        // Create NodeResult with complete metadata
        nodes.push({
          operator_address: attesterAddress,
          delegator_shares: nodeStake !== null ? String(nodeStake) : '0',
          tokens: nodeStake !== null ? String(nodeStake) : '0',
          consensus_pubkey: {
            '@type': 'aztec/AttesterAddress',
            key: attesterAddress,
          },
          jailed: false, // Will be set to true for removed attesters in next step
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
            identity: provider.providerAdmin, // For validator linking
            moniker: moniker,
            website: website,
            security_contact: provider.providerRewardsRecipient,
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

    // Mark removed attesters as jailed
    // These are nodes in the database that are no longer mapped to any provider
    try {
      const chainParams = getChainParams(chainName);
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });

      if (dbChain) {
        const existingNodes = await db.node.findMany({
          where: { chainId: dbChain.id },
          select: { operatorAddress: true },
        });

        const currentAttesters = new Set(
          Array.from(attesterToProvider.keys()).map(addr => getAddress(addr))
        );

        const removedAttesters = existingNodes
          .filter(n => !currentAttesters.has(getAddress(n.operatorAddress)))
          .map(n => n.operatorAddress);

        if (removedAttesters.length > 0) {
          await db.node.updateMany({
            where: {
              operatorAddress: { in: removedAttesters },
              chainId: dbChain.id,
            },
            data: { jailed: true },
          });
          logInfo(`Marked ${removedAttesters.length} removed attesters as jailed`);
        }
      }
    } catch (e: any) {
      logError(`Error marking removed attesters: ${e.message}`);
      // Don't fail the entire job if this step fails
    }

    return nodes;
  } catch (e) {
    logError(`Failed to fetch Aztec nodes`, e);
    return [];
  }
};

export default getAztecNodes;