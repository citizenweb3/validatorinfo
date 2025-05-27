import logger from '@/logger';
import { GetNodeParamsFunction, NodeParams } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';
import fetchData from '@/server/utils/fetch-data';

interface ChainNodeParams {
  result: {
    peers: {
      node_info: {
        id: string;
        listen_addr: string;
      };
    }[];
  };
}

const { logError } = logger('get-node-params');

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

  // peers
  try {
    const netInfo = await fetchChainData<ChainNodeParams>(chain.name, 'rpc', `/net_info`);
    result.peers = netInfo.result.peers.map((peer) => `${peer.node_info.id}@${peer.node_info.listen_addr}`).join(',');
  } catch (e) {
    logError(`Error fetching staking params for ${chain.name}`, e);
  }

  // chain-registry
  try {
    const chainRegistryUrl =
      chain.chainRegistry ?? `https://raw.githubusercontent.com/cosmos/chain-registry/master/${chain.name}/chain.json`;
    const chainRegistry: any = await fetchData(chainRegistryUrl);

    if (!result.peers) {
      result.peers =
        chainRegistry.peers?.persistent_peers?.map((peer: any) => `${peer.id}@${peer.address}`).join(',') || '';
    }

    result.seeds = chainRegistry.peers?.seeds?.map((seed: any) => `${seed.id}@${seed.address}`).join(',') || '';

    result.binaries = chainRegistry?.codebase?.binaries ? JSON.stringify(chainRegistry.codebase.binaries) : '';
    result.genesis = chainRegistry?.codebase?.genesis?.genesis_url
      ? JSON.stringify(chainRegistry.codebase.genesis.genesis_url)
      : '';

    result.keyAlgos = chainRegistry?.key_algos ? JSON.stringify(chainRegistry.key_algos) : '';
    result.daemonName = chainRegistry?.daemon_name ?? '';
    result.nodeHome = chainRegistry?.node_home ?? '';
  } catch (e) {
    logError(`Error fetching seeds for ${chain.name}`, e);
  }

  return result;
};

export default getNodeParams;
