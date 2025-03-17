import db from '@/db';
import logger from '@/logger';
import { ChainWithNodes } from '@/server/types';

const { logError, logInfo } = logger('get-nomic-chain-apr');

export const getNomicChainApr = async (chain: ChainWithNodes) => {
  try {
    const lcdEndpoint = chain.chainNodes.find((node) => node.type === 'lcd')?.url;
    if (!lcdEndpoint) {
      logError(`api node for ${chain.name} chain not found`);
      return 0;
    }

    const response = await fetch(`${lcdEndpoint}/minting/inflation`).then((data) => data.json());
    const apr = parseFloat(response.result);

    logInfo(`${chain.prettyName} APR: ${apr}`);

    await db.chain.update({
      where: { id: chain.id },
      data: { apr },
    });
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
  }
};

export default getNomicChainApr;
