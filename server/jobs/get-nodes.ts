import { ChainWithNodes } from '../types';
import getCosmosNodes from './get-cosmos-nodes';
import getNamadaNodes from './get-namada-nodes';

const getNodes = async (chains: ChainWithNodes[]) => {
  for (const chain of chains) {
    try {
      switch (chain.type) {
        case 'namada':
          await getNamadaNodes(chain);
          break;
        default:
          await getCosmosNodes(chain);
      }
    } catch (e) {
      console.error(chain.name + ' Error:', e);
    }
  }
};
export default getNodes;
