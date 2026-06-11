import { getAddress } from 'viem';

import db from '@/db';
import logger from '@/logger';
import { normalizeName } from '@/server/utils/normalize-node-name';

const { logInfo } = logger('find-or-create-aztec-validator');

// Merge a chain-keyed JSON field (providerAddresses / providerRates) preserving the
// other chains' keys. Exported for the fixture script.
export const mergeChainKeyedJson = <T>(current: unknown, chainName: string, value: T): Record<string, T> => ({
  ...((current as Record<string, T> | null | undefined) || {}),
  [chainName]: value,
});

interface AztecValidatorParams {
  providerAdmin: string;
  moniker: string;
  website: string;
  securityContact: string;
  details: string;
  chainName: string;
  // Provider base take rate as a fraction (e.g. 0.0475), stored in validator.providerRates
  providerRate?: number;
}

export async function findOrCreateAztecValidator(
  params: AztecValidatorParams,
): Promise<{ id: number; moniker: string; identity: string; providerAddresses: any }> {
  const { providerAdmin, moniker, website, securityContact, details, chainName, providerRate } = params;
  const checksummedAdmin = getAddress(providerAdmin);

  const allValidators = await db.validator.findMany({
    select: { id: true, moniker: true, identity: true, providerAddresses: true, providerRates: true },
  });

  let validator: any = null;

  for (const v of allValidators) {
    const addresses = v.providerAddresses as Record<string, string> | null;
    if (addresses && addresses[chainName] === checksummedAdmin) {
      validator = v;
      logInfo(`Found validator by providerAddress for ${chainName}: "${moniker}" (${checksummedAdmin})`);
      break;
    }
  }

  if (!validator) {
    const normalizedMoniker = normalizeName(moniker);
    if (normalizedMoniker) {
      for (const v of allValidators) {
        if (normalizeName(v.moniker) === normalizedMoniker) {
          validator = v;
          logInfo(`Found validator by moniker "${moniker}" (normalized: "${normalizedMoniker}")`);
          break;
        }
      }
    }
  }

  if (!validator) {
    const placeholderIdentity = `aztec_${chainName}_${checksummedAdmin.toLowerCase()}`;

    validator = await db.validator.create({
      data: {
        identity: placeholderIdentity,
        moniker: moniker,
        website: website,
        securityContact: securityContact,
        details: details,
        providerAddresses: {
          [chainName]: checksummedAdmin,
        },
        ...(providerRate !== undefined ? { providerRates: { [chainName]: providerRate } } : {}),
      },
    });
    logInfo(`Created global validator "${moniker}" with placeholder identity for ${chainName}`);
  } else {
    const currentProviderAddresses = (validator.providerAddresses as Record<string, string>) || {};
    const currentProviderRates = (validator.providerRates as Record<string, number>) || {};
    const needsProviderAddressUpdate = currentProviderAddresses[chainName] !== checksummedAdmin;
    const needsProviderRateUpdate = providerRate !== undefined && currentProviderRates[chainName] !== providerRate;

    if (needsProviderAddressUpdate || needsProviderRateUpdate) {
      await db.validator.update({
        where: { id: validator.id },
        data: {
          ...(needsProviderAddressUpdate
            ? { providerAddresses: mergeChainKeyedJson(currentProviderAddresses, chainName, checksummedAdmin) }
            : {}),
          ...(needsProviderRateUpdate
            ? { providerRates: mergeChainKeyedJson(currentProviderRates, chainName, providerRate) }
            : {}),
        },
      });
      if (needsProviderAddressUpdate) {
        logInfo(`Linked existing validator "${validator.moniker}" to ${chainName} (${checksummedAdmin})`);
      } else {
        logInfo(`Updated provider rate of validator "${validator.moniker}" for ${chainName}: ${providerRate}`);
      }
    }
  }

  return validator;
}
