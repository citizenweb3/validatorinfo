import db from '@/db';
import logger from '@/logger';
import { ChainWithNodes } from '@/server/types';

const { logInfo, logError, logDebug } = logger('get-chain-tvl');

interface StakingData {
  amount: {
    amount: string;
    denom: string;
  };
}

const getNomicTVL = async (chain: ChainWithNodes) => {
  try {
    logInfo(`${chain.prettyName.toUpperCase()}`);
    const indexerEndpoint = chain.chainNodes.find((node) => node.type === 'lcd')?.url;
    if (!indexerEndpoint) {
      logError(`RPC node for ${chain.name} chain not found`);
      return;
    }

    let totalSupply = '0';
    let bondedTokens = '0';
    let unbondedTokens = '0';
    let unbondedTokensRatio = 0;
    let tvl = 0;

    try {
      const stakingData: StakingData = await fetch(`${indexerEndpoint}/cosmos/bank/v1beta1/supply/unom`).then((res) =>
        res.json(),
      );
      totalSupply = stakingData.amount.amount;
    } catch (error: any) {
      logError(`Get stakingData for [${chain.name}] error: `, error);
    }

    try {
      const pool = await fetch(`${indexerEndpoint}/cosmos/staking/v1beta1/pool`).then((res) => res.json());
      bondedTokens = (+pool.pool.bonded_tokens).toString();
      unbondedTokens = (+pool.pool.not_bonded_tokens).toString();
      tvl = (+bondedTokens / +totalSupply) * 100;
      unbondedTokensRatio = (+unbondedTokens / +totalSupply) * 100;
    } catch (error: any) {
      logError(`Get TVL for [${chain.name}] error: `, error);
    }

    const data = {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
      unbondedTokens: unbondedTokens.toString(),
      unbondedTokensRatio,
      tvl,
    };

    logDebug(`TVL for [${chain.name}]: ${JSON.stringify(data)}`);

    await db.chain.update({
      where: { id: chain.id },
      data,
    });
  } catch (error: any) {
    logError(`Get TVL for [${chain.name}] error: `, error);
  }
};

export default getNomicTVL;
