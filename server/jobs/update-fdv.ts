import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';

const { logError } = logger('update-fdv');

const updateFdv = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
        include: {
          params: true,
          tokenomics: true,
        },
      });

      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }

      const decimals = dbChain?.params?.coinDecimals;
      const totalSupply = dbChain?.tokenomics?.totalSupply;

      if (totalSupply == null || totalSupply === '' || decimals == null) {
        logError(`Skip FDV for chain ${chainParams.name}: missing totalSupply or decimals`);
        continue;
      }

      const price = await db.price.findFirst({
        where: { chainId: dbChain.id },
        orderBy: { createdAt: 'desc' },
      });

      if (!price || price.value == null) {
        logError(`Skip FDV for chain ${dbChain.chainId}: missing price`);
        continue;
      }

      const supply = parseFloat(totalSupply) / 10 ** decimals;

      if (!Number.isFinite(supply) || supply <= 0) {
        logError(`Skip FDV for chain ${chainParams.name}: supply invalid=${supply}`);
        continue;
      }

      const fdv = supply * price.value;

      if (Number.isFinite(fdv) && fdv > 0) {
        await db.tokenomics.update({
          where: { chainId: dbChain.id },
          data: { fdv },
        });
      } else {
        logError(`Can't calculate and update FDV for chain ${chainParams.name}`);
      }
    } catch (e) {
      logError(`Can't update fdv for chain ${chainParams.name}:, e: ${e}`);
    }
  }
};

export default updateFdv;
