import logger from '@/logger';
import { GetNodeParamsFunction, NodeParams } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

interface ChainNodeParams {
  data: {
    peer_id: string;
    last_seen_p2p_address: string;
  }[];
}

const { logInfo, logError } = logger('get-node-params');

const getNodeParams: GetNodeParamsFunction = async (chain) => {
  const result: NodeParams = {
    peers: '',
    seeds: '',
    binaries: '',
    genesis: '',
    keyAlgos: '',
    daemonName: '',
    nodeHome: '',
  };

  try {
    const netInfo = await fetchChainData<ChainNodeParams>(chain.name, 'rest', `/eth/v1/node/peers`);
    result.peers = netInfo.data.map((peer) => `${peer.peer_id}@${peer.last_seen_p2p_address}`).join(',');

    const seeds = chain.seeds ?? [];
    result.seeds = seeds.join(',');

  } catch (e) {
    logError(`Error fetching staking params for ${chain.name}`, e);
  }

  return result;
};

export default getNodeParams;
