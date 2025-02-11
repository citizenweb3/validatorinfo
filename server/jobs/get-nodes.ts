import logger from '@/logger';

import { ChainWithNodes } from '../types';
import getCosmosNodes from './get-cosmos-nodes';
import getNamadaNodes from './get-namada-nodes';

const { logError } = logger('get-nodes');

const getNodes = async (chains: ChainWithNodes[]) => {
  for (const chain of chains) {
    if (chain.hasValidators) {
      try {
        switch (chain.ecosystem) {
          case 'namada':
            await getNamadaNodes(chain);
            break;
          default:
            await getCosmosNodes(chain);
        }
      } catch (e) {
        logError(`Can't fetch nodes for ${chain.name}:`, e);
      }
    }
  }
};
export default getNodes;
