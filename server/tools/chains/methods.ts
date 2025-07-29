import atomoneChainMethods from '@/server/tools/chains/atomone/methods';
import bostromChainMethods from '@/server/tools/chains/bostrom/methods';
import celestiaChainMethods from '@/server/tools/chains/celestia/methods';
import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import dymensionChainMethods from '@/server/tools/chains/dymension/methods';
import ethereumChainMethods from '@/server/tools/chains/ethereum/methods';
import govgenChainMethods from '@/server/tools/chains/govgen/methods';
import likecoinChainMethods from '@/server/tools/chains/likecoin/methods';
import namadaChainMethods from '@/server/tools/chains/namada/methods';
import neutronChainMethods from '@/server/tools/chains/neutron/methods';
import nillionChainMethods from '@/server/tools/chains/nillion/methods';
import nomicChainMethods from '@/server/tools/chains/nomic/methods';
import nymChainMethods from '@/server/tools/chains/nym/methods';
import osmosisChainMethods from '@/server/tools/chains/osmosis/methods';
import polkadotChainMethods from '@/server/tools/chains/polkadot/methods';
import quicksilverChainMethods from '@/server/tools/chains/quicksilver/methods';
import solanaChainMethods from '@/server/tools/chains/solana/methods';
import spacePussyChainMethods from '@/server/tools/chains/space-pussy/methods';
import strideChainMethods from '@/server/tools/chains/stride/methods';
import symphonyChainMethods from '@/server/tools/chains/symphony-testnet/methods';

const chainMethods: Record<string, ChainMethods> = {
  namada: namadaChainMethods,
  nomic: nomicChainMethods,
  osmosis: osmosisChainMethods,
  quicksilver: quicksilverChainMethods,
  cosmoshub: cosmosChainMethods,
  celestia: celestiaChainMethods,
  dymension: dymensionChainMethods,
  likecoin: likecoinChainMethods,
  bostrom: bostromChainMethods,
  nillion: nillionChainMethods,
  nym: nymChainMethods,

  // returns 0
  stride: strideChainMethods,
  govgen: govgenChainMethods,
  neutron: neutronChainMethods,
  'symphony-testnet': symphonyChainMethods,

  bitcanna: cosmosChainMethods,
  uptick: cosmosChainMethods,
  gravitybridge: cosmosChainMethods,
  althea: cosmosChainMethods,
  atomone: atomoneChainMethods,
  union: cosmosChainMethods,
  axone: cosmosChainMethods,

  solana: solanaChainMethods,
  polkadot: polkadotChainMethods,

  'namada-testnet': namadaChainMethods,
  'neutron-testnet': neutronChainMethods,
  'artela-testnet': cosmosChainMethods,
  'space-pussy': spacePussyChainMethods,
  'warden-testnet': cosmosChainMethods,
  'ethereum-sepolia': ethereumChainMethods,
};

const getChainMethods = (chainName: string): ChainMethods => {
  const methods = chainMethods[chainName];
  if (!methods) {
    throw new Error(`Chain methods for ${chainName} not found`);
  }
  return methods;
};

export default getChainMethods;
