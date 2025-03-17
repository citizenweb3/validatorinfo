import db from '@/db';
import logger from '@/logger';

import { ChainWithNodes } from '../../types';

const { logError, logInfo } = logger('get-namada-chain-apr');

export const getNamadaChainApr = async (chain: ChainWithNodes) => {
  try {
    const lcdEndpoint = chain.chainNodes.find((node) => node.type === 'indexer')?.url;
    if (!lcdEndpoint) {
      logError(`Indexer node for ${chain.name} chain not found`);
      return 0;
    }

    const response = await fetch(`${lcdEndpoint}/api/v1/chain/parameters`).then((data) => data.json());
    const apr = parseFloat(response.apr);

    logInfo(`${chain.prettyName} APR: ${apr}`);

    await db.chain.update({
      where: { id: chain.id },
      data: { apr },
    });
  } catch (e) {
    logError(`${chain.name} Can't fetch APR: `, e);
  }
};

export default getNamadaChainApr;
