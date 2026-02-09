import { getAddress } from 'viem';

import db from '@/db';
import logger from '@/logger';
import { fetchProviderMetadata } from '@/server/tools/chains/aztec/utils/fetch-provider-metadata';
import downloadImage from '@/server/utils/download-image';

const { logInfo, logError, logWarn } = logger('update-validators-aztec-logos');

const updateValidatorsAztecLogos = async () => {
  try {
    logInfo('Starting Aztec validators logos update');

    const validatorsWithoutLogo = await db.validator.findMany({
      where: {
        url: null,
      },
      include: {
        nodes: {
          include: {
            chain: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    logInfo(`Found ${validatorsWithoutLogo.length} validators without logo`);

    const aztecValidators = validatorsWithoutLogo.filter((validator) =>
      validator.nodes.some((node) => node.chain.name === 'aztec' || node.chain.name === 'aztec-testnet'),
    );

    logInfo(`Found ${aztecValidators.length} validators with Aztec nodes and no logo`);

    if (aztecValidators.length === 0) {
      logInfo('No validators to update');
      return;
    }

    const providerMetadata = await fetchProviderMetadata(true);
    logInfo(`Fetched ${providerMetadata.size} providers with metadata`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const validator of aztecValidators) {
      try {
        if (!validator.providerAddresses) {
          skippedCount++;
          continue;
        }

        const providerAddresses = validator.providerAddresses as Record<string, string>;

        const aztecAddress = providerAddresses['aztec'] || providerAddresses['aztec-testnet'];

        if (!aztecAddress) {
          skippedCount++;
          continue;
        }

        const addressWithoutPrefix = aztecAddress.toLowerCase().replace(/^0x/, '');
        if (!/^[0-9a-f]{40}$/i.test(addressWithoutPrefix)) {
          skippedCount++;
          continue;
        }

        const checksummedAddress = getAddress(aztecAddress);
        const metadata = providerMetadata.get(checksummedAddress);

        if (metadata?.logoUrl) {
          const localLogoPath = await downloadImage('vals', validator.id, metadata.logoUrl);

          const logoUrl = localLogoPath || metadata.logoUrl;

          await db.validator.update({
            where: { id: validator.id },
            data: { url: logoUrl },
          });

          if (localLogoPath) {
            logInfo(
              `Updated validator ${validator.moniker} (${checksummedAddress}) with local logo: ${localLogoPath}`,
            );
          } else {
            logWarn(
              `Failed to download logo for validator ${validator.moniker}, using external URL: ${metadata.logoUrl}`,
            );
          }

          updatedCount++;
        }
      } catch (e: any) {
        logWarn(`Failed to update validator ${validator.moniker}: ${e.message}`);
      }
    }

    logInfo(
      `Successfully updated ${updatedCount} validators with Aztec logos (${skippedCount} skipped - missing or invalid providerAddresses)`,
    );
  } catch (e: any) {
    logError(`Failed to update validators Aztec logos: ${e.message}`);
  }
};

export default updateValidatorsAztecLogos;
