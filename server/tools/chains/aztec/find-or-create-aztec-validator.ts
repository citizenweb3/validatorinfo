import { getAddress } from 'viem';

import db from '@/db';
import logger from '@/logger';
import { normalizeName } from '@/server/utils/normalize-node-name';

const { logInfo } = logger('find-or-create-aztec-validator');

interface AztecValidatorParams {
  providerAdmin: string;
  moniker: string;
  website: string;
  securityContact: string;
  details: string;
  chainName: string;
}

export async function findOrCreateAztecValidator(
  params: AztecValidatorParams,
): Promise<{ id: number; moniker: string; identity: string; providerAddresses: any }> {
  const { providerAdmin, moniker, website, securityContact, details, chainName } = params;
  const checksummedAdmin = getAddress(providerAdmin);

  const allValidators = await db.validator.findMany({
    select: { id: true, moniker: true, identity: true, providerAddresses: true },
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
      },
    });
    logInfo(`Created global validator "${moniker}" with placeholder identity for ${chainName}`);
  } else {
    const currentProviderAddresses = (validator.providerAddresses as Record<string, string>) || {};

    if (currentProviderAddresses[chainName] !== checksummedAdmin) {
      const updatedProviderAddresses = {
        ...currentProviderAddresses,
        [chainName]: checksummedAdmin,
      };

      await db.validator.update({
        where: { id: validator.id },
        data: {
          providerAddresses: updatedProviderAddresses,
        },
      });
      logInfo(`Updated providerAddresses for validator "${moniker}" on ${chainName}`);
    }
  }

  return validator;
}
