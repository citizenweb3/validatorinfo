import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import govgenChainMethods from '@/server/tools/chains/govgen/methods';
import namadaChainMethods from '@/server/tools/chains/namada/methods';
import neutronChainMethods from '@/server/tools/chains/neutron/methods';
import nomicChainMethods from '@/server/tools/chains/nomic/methods';
import osmosisChainMethods from '@/server/tools/chains/osmosis/methods';
import quicksilverChainMethods from '@/server/tools/chains/quicksilver/methods';
import strideChainMethods from '@/server/tools/chains/stride/methods';
import symphonyChainMethods from '@/server/tools/chains/symphony-testnet/methods';

const chainMethods: Record<string, ChainMethods> = {
  namada: namadaChainMethods,
  nomic: nomicChainMethods,
  osmosis: osmosisChainMethods,
  quicksilver: quicksilverChainMethods,
  cosmoshub: cosmosChainMethods,

  // returns 0
  stride: strideChainMethods,
  govgen: govgenChainMethods,
  neutron: neutronChainMethods,
  'symphony-testnet': symphonyChainMethods,

  celestia: cosmosChainMethods,
  bitcanna: cosmosChainMethods,
  likecoin: cosmosChainMethods,
  uptick: cosmosChainMethods,
  gravitybridge: cosmosChainMethods,
  dymension: cosmosChainMethods,
  althea: cosmosChainMethods,
  atomone: cosmosChainMethods,
  union: cosmosChainMethods,
  axone: cosmosChainMethods,
  bostrom: cosmosChainMethods,

  'neutron-testnet': neutronChainMethods,
  'nillion-testnet': cosmosChainMethods,
  'artela-testnet': cosmosChainMethods,
  'space-pussy': cosmosChainMethods,
};

const getChainMethods = (chainName: string): ChainMethods => {
  const methods = chainMethods[chainName];
  if (!methods) {
    throw new Error(`Chain methods for ${chainName} not found`);
  }
  return methods;
};

export default getChainMethods;
