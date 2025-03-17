import logger from '@/logger';
import getCosmosTVL from '@/server/jobs/tvl/get-cosmos-tvl';
import getNamadaTVL from '@/server/jobs/tvl/get-namada-tvl';
import getNomicTVL from '@/server/jobs/tvl/get-nomic-tvl';

import { ChainWithNodes } from '../../types';

const { logError } = logger('get-chain-tvl');

export const getChainTVL = async (chains: ChainWithNodes[]) => {
  try {
    for (const chain of chains) {
      if (chain?.name === 'nomic') {
        await getNomicTVL(chain);
      } else if (chain.ecosystem === 'namada') {
        await getNamadaTVL(chain);
      } else {
        await getCosmosTVL(chain);
      }
    }
  } catch (e) {
    logError("Can't fetch TVL's: ", e);
  }
};

export default getChainTVL;
