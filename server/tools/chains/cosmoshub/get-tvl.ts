import { QueryClient, setupBankExtension, setupStakingExtension } from '@cosmjs/stargate';
import { Tendermint34Client } from '@cosmjs/tendermint-rpc';

import logger from '@/logger';
import { GetTvlFunction } from '@/server/tools/chains/chain-indexer';

const { logError, logDebug } = logger('get-tvl');

const getTvl: GetTvlFunction = async (chain) => {
  try {
    const rpcEndpoint = chain.nodes.find((node) => node.type === 'rpc')?.url;
    if (!rpcEndpoint) {
      logError(`RPC node for ${chain.name} chain not found`);
      return null;
    }

    const tmClient = await Tendermint34Client.connect(rpcEndpoint);

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
    let tvl = 0;
    let unbondedTokensRatio = 0;

    try {
      const stakingPool = await queryClient.staking.pool();
      bondedTokens = stakingPool.pool?.bondedTokens || '0';
      unbondedTokens = stakingPool.pool?.notBondedTokens || '0';

      tvl = +bondedTokens / +totalSupply;
      unbondedTokensRatio = +(+unbondedTokens / +totalSupply);
    } catch (e) {
      logError(`Staking pool for ${chain.name} chain not found`, e);
    }

    logDebug(
      `TVL for [${chain.name}]: ${JSON.stringify({ totalSupply, bondedTokens, unbondedTokens, tvl, unbondedTokensRatio })}`,
    );

    return {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
      unbondedTokens: unbondedTokens.toString(),
      unbondedTokensRatio,
      tvl,
    };
  } catch (error: any) {
    logError(`Get TVL for [${chain.name}] error: `, error);
    return null;
  }
};

export default getTvl;
