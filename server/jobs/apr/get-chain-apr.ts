import logger from '@/logger';
import getCosmosChainApr from '@/server/jobs/apr/get-cosmos-chain-apr';
import getNamadaChainApr from '@/server/jobs/apr/get-namada-chain-apr';
import getNomicChainApr from '@/server/jobs/apr/get-nomic-chain-apr';
import getOsmosisChainApr from '@/server/jobs/apr/get-osmosis-chain-apr';
import getQuicksilverChainApr from '@/server/jobs/apr/get-quicksilver-chain-apr';

import { ChainWithNodes } from '../../types';

const { logError, logInfo } = logger('get-chain-apr');

export const getChainApr = async (chains: ChainWithNodes[]) => {
  for (const chain of chains) {
    try {
      switch (chain.name) {
        case 'govgen':
        case 'stride':
        case 'neutron':
        case 'neutron-testnet':
        case 'symphony-testnet':
          logInfo(`${chain.prettyName} APR: 0 - no apr for this chain`);
          break;
        case 'osmosis':
          await getOsmosisChainApr(chain);
          break;
        case 'quicksilver':
          await getQuicksilverChainApr(chain);
          break;
        case 'namada':
          await getNamadaChainApr(chain);
          break;
        case 'nomic':
          await getNomicChainApr(chain);
          break;
        default:
          await getCosmosChainApr(chain);
      }
    } catch (e) {
      logError(`${chain.name} Can't fetch APR: `, e);
    }
  }
};

export default getChainApr;
