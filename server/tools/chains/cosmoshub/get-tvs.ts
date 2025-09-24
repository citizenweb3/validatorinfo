import { QueryClient, setupBankExtension, setupStakingExtension } from '@cosmjs/stargate';

import logger from '@/logger';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import getTendermintClient from '@/server/tools/get-tendermint-client';


const { logError, logDebug } = logger('get-tvs');

const getTvs: GetTvsFunction = async (chain) => {
  try {
    const tmClient = await getTendermintClient(chain.name);

    const queryClient = QueryClient.withExtensions(tmClient, setupStakingExtension, setupBankExtension);

    let totalSupply = '';
    try {
      const supplyData = await queryClient.bank.supplyOf(chain.minimalDenom);
      totalSupply = supplyData.amount;
    } catch (e) {
      logError(`Total supply for ${chain.name} chain not found`, e);
    }

    logDebug(`Total supply for ${chain.name} chain: ${totalSupply}`);

    if (!totalSupply || totalSupply === '0') {
      try {
        const supplyDataFromTotal = await queryClient.bank.totalSupply();
        const supplyDataDenom = supplyDataFromTotal.supply.find(
          (supply) => supply.denom === chain.minimalDenom || supply.denom === chain.denom.toLowerCase(),
        );
        totalSupply = supplyDataDenom?.amount ?? '';
        logDebug(`Total supply from denom for ${chain.name} chain: ${totalSupply}`);
        if (!totalSupply) {
          logError(`Total supply for ${chain.name} chain not found again`, {
            message: JSON.stringify(supplyDataFromTotal),
          });
          return null;
        }
      } catch (e) {
        logError(`Total supply for ${chain.name} chain not found again`, e);
      }
    }

    let bondedTokens = '0';
    let unbondedTokens = '0';
    let tvs = 0;
    let unbondedTokensRatio = 0;

    try {
      const stakingPool = await queryClient.staking.pool();
      bondedTokens = stakingPool.pool?.bondedTokens || '0';
      unbondedTokens = stakingPool.pool?.notBondedTokens || '0';

      tvs = +bondedTokens / +totalSupply;
      unbondedTokensRatio = +(+unbondedTokens / +totalSupply);
    } catch (e) {
      logError(`Staking pool for ${chain.name} chain not found`, e);
    }

    logDebug(
      `TVS for [${chain.name}]: ${JSON.stringify({
        totalSupply,
        bondedTokens,
        unbondedTokens,
        tvs,
        unbondedTokensRatio,
      })}`,
    );

    return {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
      unbondedTokens: unbondedTokens.toString(),
      unbondedTokensRatio,
      tvs,
    };
  } catch (error: any) {
    logError(`Get TVS for [${chain.name}] error: `, error);
    return null;
  }
};

export default getTvs;
