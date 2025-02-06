import logger from '@/logger';

import { ChainWithNodes } from '../types';
import getCosmosNodes from './get-cosmos-nodes';
import getNamadaNodes from './get-namada-nodes';

const { logInfo, logError } = logger('get-nodes');

const getNodes = async (chains: ChainWithNodes[]) => {
  for (const chain of chains) {
    if (chain.hasValidators) {
      try {
        switch (chain.ecosystem) {
          case 'namada':
            logInfo(`Get namada validators for ${chain.name}`);
            await getNamadaNodes(chain);
            break;
          default:
            logInfo(`Get cosmos validators for ${chain.name}`);
            await getCosmosNodes(chain);
        }
      } catch (e) {
        logError(`Can't fetch nodes for ${chain.name}:`, e);
      }
    }
  }
};
export default getNodes;
