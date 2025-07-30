import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensOnchain } from '@/server/tools/chains/chain-indexer';
import fetchModulesLockedAmount from '@/server/tools/chains/cosmoshub/utils/locked-coins-calculation/fetch-modules-locked-amount';
import fetchVestingLockedAmount from '@/server/tools/chains/cosmoshub/utils/locked-coins-calculation/fetch-vesting-locked-amount';

const { logError } = logger('cosmos-circulating-tokens-onchain');

const getCirculatingTokensOnchain: GetCirculatingTokensOnchain = async (
  chain: AddChainProps,
  totalSupply?: string,
  communityPool?: string,
) => {
  if (totalSupply) {
    const modulesLockedAmount = BigInt((await fetchModulesLockedAmount(chain)) ?? 0);
    const vestingLockedAmount = BigInt((await fetchVestingLockedAmount(chain)) ?? 0);
    const commPoolBigInt = BigInt(String(communityPool).split('.')[0]);
    const totalSupplyBigInt = BigInt(String(totalSupply).split('.')[0]);
    return String(totalSupplyBigInt - commPoolBigInt - vestingLockedAmount - modulesLockedAmount);
  } else {
    logError(`${chain.name} doesn't have token supply amount, can't calculate circulating tokens.`);
    return null;
  }
};

export default getCirculatingTokensOnchain;
