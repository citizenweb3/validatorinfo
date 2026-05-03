import { chainParamsArray } from '@/server/tools/chains/params';

const excludeChains: string[] = [
  'nillion',
  'space-pussy',
  'symphony-testnet',
  'warden-testnet'
];

const includeChains: string[] = [];

const chainNames = chainParamsArray
  .map((chain) => chain.name)
  .filter(
    (chainName) =>
      excludeChains.indexOf(chainName) === -1 && (!includeChains.length || includeChains.indexOf(chainName) !== -1),
  );
export default chainNames;
