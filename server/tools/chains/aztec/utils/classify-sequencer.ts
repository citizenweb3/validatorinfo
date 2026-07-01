import { ProviderMetadata } from '@/server/tools/chains/aztec/utils/fetch-provider-metadata';
import { ProviderConfig } from '@/server/tools/chains/aztec/utils/get-providers';

export interface ClassifySequencerInput {
  chainName: 'aztec' | 'aztec-testnet';
  attester: string;
  eventProviderId?: bigint;
  selfStakeMap: Map<string, string>;
  onChainProviderAdmins: Set<string>;
  providerMetadata: Map<string, ProviderMetadata>;
  providers: Map<bigint, ProviderConfig>;
}

export type SequencerClassification =
  | { kind: 'delegated'; provider: ProviderConfig; warns: string[] }
  | { kind: 'provider-self-stake'; providerAdmin: string; metadata: ProviderMetadata; warns: string[] }
  | { kind: 'anonymous'; warns: string[] };

export const classifyAztecSequencer = (input: ClassifySequencerInput): SequencerClassification => {
  const { chainName, attester, eventProviderId, selfStakeMap, onChainProviderAdmins, providerMetadata, providers } =
    input;

  const warns: string[] = [];
  const selfStakeProviderAddress = selfStakeMap.get(attester);

  // Events win: the on-chain AttestersAddedToProvider mapping is the source of truth
  // for delegation; the API self-stake list is off-chain metadata.
  if (eventProviderId !== undefined) {
    if (selfStakeProviderAddress) {
      warns.push(
        `Attester ${attester} is delegated to provider ${eventProviderId} by on-chain events ` +
        `but also claimed in providerSelfStake by ${selfStakeProviderAddress} - events win`,
      );
    }

    const provider = providers.get(eventProviderId);
    if (provider) {
      return { kind: 'delegated', provider, warns };
    }

    warns.push(`Provider ${eventProviderId} not found for attester ${attester}, treating as self-staked`);
    return { kind: 'anonymous', warns };
  }

  if (chainName !== 'aztec' || !selfStakeProviderAddress) {
    return { kind: 'anonymous', warns };
  }

  // The API provider address must resolve to a current on-chain providerAdmin -
  // a stale/compromised API entry must not reach findOrCreateAztecValidator.
  if (!onChainProviderAdmins.has(selfStakeProviderAddress)) {
    warns.push(
      `Attester ${attester} claimed in providerSelfStake by ${selfStakeProviderAddress}, ` +
      'which is not an on-chain providerAdmin - keeping it anonymous',
    );
    return { kind: 'anonymous', warns };
  }

  const metadata = providerMetadata.get(selfStakeProviderAddress);
  if (!metadata?.name) {
    warns.push(
      `Attester ${attester} claimed in providerSelfStake by ${selfStakeProviderAddress}, ` +
      'but provider metadata is missing or has an empty name - keeping it anonymous',
    );
    return { kind: 'anonymous', warns };
  }

  return { kind: 'provider-self-stake', providerAdmin: selfStakeProviderAddress, metadata, warns };
};
