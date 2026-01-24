import logger from '@/logger';
import { findOrCreateAztecValidator } from '@/server/tools/chains/aztec/find-or-create-aztec-validator';
import { fetchProviderMetadata } from '@/server/tools/chains/aztec/utils/fetch-provider-metadata';
import { getProviders } from '@/server/tools/chains/aztec/utils/get-providers';
import { getL1 } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { getAddress } from 'viem';

const { logInfo, logError } = logger('sync-aztec-providers');

export const syncAztecProviders = async (chainName: 'aztec' | 'aztec-testnet'): Promise<void> => {
  logInfo(`Starting provider sync for ${chainName}`);

  const l1Chain = getChainParams(getL1[chainName]);
  const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

  if (!l1RpcUrls.length) {
    logError(`${chainName}: No L1 RPC URLs found - cannot sync providers`);
    return;
  }

  const providers = await getProviders(l1RpcUrls, chainName);

  if (providers.size === 0) {
    logError(`${chainName}: No providers found in contract`);
    return;
  }

  logInfo(`Found ${providers.size} providers in contract`);

  const providerMetadata = await fetchProviderMetadata();

  logInfo(`Loaded ${providerMetadata.size} provider metadata entries`);

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const [providerId, provider] of Array.from(providers.entries())) {
    try {
      const checksummedAdmin = getAddress(provider.providerAdmin);

      const metadata = providerMetadata.get(checksummedAdmin);

      const moniker = metadata?.name || `Provider ${providerId}`;
      const website = metadata?.website || '';
      const description = metadata?.description || '';

      const result = await findOrCreateAztecValidator({
        providerAdmin: checksummedAdmin,
        moniker,
        website,
        securityContact: '',
        details: description,
        chainName,
      });

      if (result.moniker === moniker) {
        updated++;
      } else {
        created++;
      }
    } catch (e: any) {
      logError(`Failed to sync provider ${providerId}: ${e.message}`);
      errors++;
    }
  }

  logInfo(`Provider sync complete: ${created} created, ${updated} updated, ${errors} errors`);
};

export default syncAztecProviders;
