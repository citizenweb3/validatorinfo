import type { AccountInfo } from '@polkadot/types/interfaces';

import logger from '@/logger';
import { GetCommPoolFunction } from '@/server/tools/chains/chain-indexer';
import { connectWsApi } from '@/server/tools/chains/polkadot/utils/connect-ws-api';


const { logError } = logger('polkadot-comm-pool');

const getCommunityPool: GetCommPoolFunction = async (chain) => {
  const wsList = chain.nodes.filter((n: any) => n.type === 'ws').map((n: any) => n.url);
  if (!wsList.length) {
    logError(`No ws url for chain '${chain.name}'`);
    return null;
  }

  const api = await connectWsApi(wsList, 3);
  const treasury = '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB';

  try {
    const acc = await api.query.system.account<AccountInfo>(treasury);
    return acc?.data?.free ? acc.data.free.toString() : null;
  } catch (e) {
    logError(`${chain.name} Can't fetch community pool: `, e);
    return null;
  } finally {
    try {
      await api.disconnect();
    } catch (e) {
      logError(`Could not disconnect websocket for ${chain.name}: `, e);
    }
  }
};

export default getCommunityPool;
