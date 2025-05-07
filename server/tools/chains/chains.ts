import { chainParamsArray } from '@/server/tools/chains/params';

const excludeChains: string[] = [
  // 'cosmoshub',
  // 'celestia',
  // 'bitcanna',
  // 'likecoin',
  // 'stride',
  // 'uptick',
  // 'gravitybridge',
  // 'dymension',
  // 'althea',
  // 'union',
  // 'axone',
  // 'symphony-testnet',
  // 'artela-testnet',
  // 'quicksilver',
  // 'osmosis',
  // 'namada',
  // 'govgen',
  // 'bostrom',
  // 'nillion-testnet',
  // 'neutron',
  // 'neutron-testnet',
];

const includeChains: string[] = [];

const chainNames = chainParamsArray
  .map((chain) => chain.name)
  .filter(
    (chainName) =>
      excludeChains.indexOf(chainName) === -1 && (!includeChains.length || includeChains.indexOf(chainName) !== -1),
  );
export default chainNames;
