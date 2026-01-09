import db from '@/db';
import logger from '@/logger';
import getL1ContractAddresses from '@/server/tools/chains/aztec/utils/get-l1-contract-addresses';
import { getChainParams } from '@/server/tools/chains/params';

const { logInfo, logError } = logger('update-aztec-l1-contracts');

const AZTEC_CHAINS = ['aztec', 'aztec-testnet'] as const;

const updateAztecL1Contracts = async () => {
  logInfo('Starting Aztec L1 contracts update');

  for (const chainName of AZTEC_CHAINS) {
    try {
      const chainParams = getChainParams(chainName);

      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: { params: true },
      });

      if (!dbChain) {
        logInfo(`Chain ${chainName} not found in database, skipping`);
        continue;
      }

      if (!dbChain.params) {
        logError(`Chain ${chainName} has no params record, skipping`);
        continue;
      }

      logInfo(`${chainName}: Fetching L1 contract addresses`);

      const contractAddresses = await getL1ContractAddresses(chainName);

      if (!contractAddresses) {
        logError(`${chainName}: Failed to fetch L1 contract addresses`);
        continue;
      }

      // Store as JSON string
      const contractsJson = JSON.stringify(contractAddresses);

      await db.chainParams.update({
        where: { id: dbChain.params.id },
        data: {
          l1ContractsAddresses: contractsJson,
        },
      });

      logInfo(`${chainName}: Successfully updated L1 contract addresses`);
    } catch (e: any) {
      logError(`Error processing ${chainName}: ${e.message}`);
    }
  }

  logInfo('Aztec L1 contracts update completed');
};

export default updateAztecL1Contracts;
