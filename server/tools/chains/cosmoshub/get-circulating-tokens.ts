import logger from '@/logger';
import { AddChainProps, GetCirculatingTokens } from '@/server/tools/chains/chain-indexer';
import fetchModulesLockedAmount from '@/server/tools/chains/cosmoshub/utils/locked-coins-calculation/fetch-modules-locked-amount';
import fetchVestingLockedAmount from '@/server/tools/chains/cosmoshub/utils/locked-coins-calculation/fetch-vesting-locked-amount';

const { logError } = logger('cosmos-circulating-tokens');

const getCirculatingTokens: GetCirculatingTokens = async (
  chain: AddChainProps,
  totalSupply?: string,
  communityPool?: string,
) => {
  if (totalSupply) {
    const modulesLockedAmount = BigInt((await fetchModulesLockedAmount(chain)) ?? 0);
    const vestingLockedAmount = BigInt((await fetchVestingLockedAmount(chain)) ?? 0);
    const foundationLockedAmount = BigInt(0);
    const commPool = BigInt(communityPool ?? 0);
    const totalSupplyBigInt = BigInt(String(totalSupply).split('.')[0]);

    return String(totalSupplyBigInt - commPool - foundationLockedAmount - vestingLockedAmount - modulesLockedAmount);
  } else {
    logError(`${chain.name} doesn't have token supply amount, can't calculate circulating tokens.`);
    return null;
  }
};

export default getCirculatingTokens;
