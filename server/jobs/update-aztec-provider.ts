import db from '@/db';
import logger from '@/logger';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getProviderAttesters } from '@/server/tools/chains/aztec/utils/get-provider-attesters';
import { getProviders } from '@/server/tools/chains/aztec/utils/get-providers';
import providersMonikersData from '@/server/tools/chains/aztec/utils/providers_monikers.json';
import { getChainParams } from '@/server/tools/chains/params';
import { getAddress } from 'viem';

const { logInfo, logError, logWarn } = logger('update-aztec-provider');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;
const AZTEC_PROVIDERS_API = 'https://d10cun7h2qqnvc.cloudfront.net/api/providers';

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

async function fetchAztecProviderNames(): Promise<Map<string, { name: string; website: string; description: string }>> {
  try {
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
      logError(`Failed to fetch Aztec provider names from API: ${response.statusText}, falling back to local JSON`);
      return loadAztecProviderNamesFromFile();
    }

    const data: AztecProviderApiResponse = await response.json();
    const providerNames = new Map<string, { name: string; website: string; description: string }>();

    for (const provider of data.providers) {
      const checksummedAddress = getAddress(provider.address);
      providerNames.set(checksummedAddress, {
        name: provider.name,
        website: provider.website || '',
        description: provider.description || '',
      });
    }

    logInfo(`Fetched ${providerNames.size} provider names from API`);
    return providerNames;
  } catch (e: any) {
    logWarn(`Error fetching Aztec provider names from API: ${e.message}, falling back to local JSON`);
    return loadAztecProviderNamesFromFile();
  }
}

function loadAztecProviderNamesFromFile(): Map<string, { name: string; website: string; description: string }> {
  try {
    const data = providersMonikersData as AztecProviderApiResponse;
    const providerNames = new Map<string, { name: string; website: string; description: string }>();

    for (const provider of data.providers) {
      const checksummedAddress = getAddress(provider.address);
      providerNames.set(checksummedAddress, {
        name: provider.name,
        website: provider.website || '',
        description: provider.description || '',
      });
    }

    logInfo(`Loaded ${providerNames.size} provider names from local JSON file`);
    return providerNames;
  } catch (e: any) {
    logError(`Error loading Aztec provider names from local JSON file: ${e.message}`);
    return new Map();
  }
}

const updateAztecProvider = async () => {
  logInfo('Starting Aztec provider update');

  const providerNamesFromApi = await fetchAztecProviderNames();

  for (const chainName of AZTEC_CHAINS) {
    try {
      const chainParams = getChainParams(chainName);
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });

      if (!dbChain) {
        logError(`Chain ${chainName} not found in database`);
        continue;
      }

      const l1Chain = getChainParams(getL1[chainName]);
      const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

      if (l1RpcUrls.length === 0) {
        logError(`No L1 RPC URLs found for ${chainName}, skipping`);
        continue;
      }

      const [providers, attesterToProvider] = await Promise.all([
        getProviders(l1RpcUrls, chainName),
        getProviderAttesters(l1RpcUrls, chainName),
      ]);

      logInfo(`Fetched ${providers.size} providers and ${attesterToProvider.size} attester mappings for ${chainName}`);

      if (providers.size === 0) {
        logError(`No providers found for ${chainName}, skipping`);
        continue;
      }

      const nodes = await db.node.findMany({
        where: { chainId: dbChain.id },
        include: { validator: true },
      });

      logInfo(`Found ${nodes.length} nodes for ${chainName} in database`);

      let updatedCount = 0;
      let createdValidators = 0;
      let linkedToExisting = 0;

      for (const node of nodes) {
        try {
          const providerId = attesterToProvider.get(getAddress(node.operatorAddress));

          if (providerId === undefined) {
            continue;
          }

          const provider = providers.get(providerId);
          if (!provider) {
            logWarn(`Provider ${providerId} not found for node ${node.operatorAddress}`);
            continue;
          }

          // Get provider info from API (only for aztec mainnet)
          const providerInfo = chainName === 'aztec'
            ? providerNamesFromApi.get(getAddress(provider.providerAdmin))
            : undefined;

          const moniker = providerInfo?.name || `Provider ${providerId}`;
          const website = providerInfo?.website || '';
          const details = providerInfo?.description || '';

          let validator;

          // For aztec mainnet with API data, try to find validator by moniker (cross-chain validator)
          if (chainName === 'aztec' && providerInfo) {
            validator = await db.validator.findFirst({
              where: { moniker: moniker },
            });

            if (validator) {
              linkedToExisting++;
              logInfo(`Found existing validator with moniker "${moniker}" for provider ${providerId}`);

              // Update validator's identity to include provider admin if different
              if (validator.identity !== provider.providerAdmin) {
                await db.validator.update({
                  where: { id: validator.id },
                  data: {
                    identity: provider.providerAdmin,
                    chainId: validator.chainId || dbChain.id, // Keep existing chainId or set if null
                  },
                });
              }
            }
          }

          // If not found by moniker, try to find by identity (provider admin address)
          if (!validator) {
            validator = await db.validator.findFirst({
              where: { identity: provider.providerAdmin },
            });
          }

          // Create new validator if doesn't exist
          if (!validator) {
            validator = await db.validator.create({
              data: {
                identity: provider.providerAdmin,
                moniker: moniker,
                website: website,
                securityContact: provider.providerRewardsRecipient,
                details: details,
                chainId: dbChain.id,
              },
            });
            createdValidators++;
            logInfo(`Created validator "${moniker}" for provider ${providerId} (${provider.providerAdmin})`);
          } else if (validator.chainId !== dbChain.id) {
            // Update chainId if validator exists but chainId is not set or different
            await db.validator.update({
              where: { id: validator.id },
              data: { chainId: dbChain.id },
            });
          }

          // Update node to link to this validator
          const newRate = String(provider.providerTakeRate / 10000);
          const needsUpdate =
            node.validatorId !== validator.id ||
            node.moniker !== moniker ||
            node.identity !== provider.providerAdmin ||
            node.rate !== newRate;

          if (needsUpdate) {
            await db.node.update({
              where: { id: node.id },
              data: {
                validatorId: validator.id,
                identity: provider.providerAdmin,
                moniker: moniker,
                rate: newRate,
              },
            });
            updatedCount++;
            logInfo(`Updated node ${node.operatorAddress} with validator "${moniker}"`);
          }
        } catch (e: any) {
          logError(`Error processing node ${node.operatorAddress}: ${e.message}`);
        }
      }

      logInfo(
        `Completed ${chainName}: ${updatedCount} nodes updated, ${createdValidators} new validators created, ${linkedToExisting} linked to existing validators`
      );
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec provider update completed');
};

export default updateAztecProvider;
