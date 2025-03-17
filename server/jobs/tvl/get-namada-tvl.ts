import db from '@/db';
import logger from '@/logger';
import { ChainWithNodes } from '@/server/types';

const { logInfo, logError, logDebug } = logger('get-chain-tvl');

interface StakingData {
  address: string;
  totalSupply: string;
  effectiveSupply: string;
}

const getNamadaTVL = async (chain: ChainWithNodes) => {
  try {
    logInfo(`${chain.prettyName.toUpperCase()}`);
    const indexerEndpoint = chain.chainNodes.find((node) => node.type === 'indexer')?.url;
    if (!indexerEndpoint) {
      logError(`RPC node for ${chain.name} chain not found`);
      return;
    }

    let totalSupply = '0';
    let bondedTokens = '0';
    let tvl = 0;

    try {
      const stakingData: StakingData = await fetch(
        `${indexerEndpoint}/api/v1/chain/token-supply?address=tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7`,
      ).then((res) => res.json());
      totalSupply = stakingData.totalSupply;
    } catch (error: any) {
      logError(`Get stakingData for [${chain.name}] error: `, error);
    }

    try {
      const votingPower = await fetch(`${indexerEndpoint}/api/v1/pos/voting-power`).then((res) => res.json());
      bondedTokens = (+votingPower.totalVotingPower * 1e6).toString();
      tvl = (+bondedTokens / +totalSupply) * 100;
    } catch (error: any) {
      logError(`Get TVL for [${chain.name}] error: `, error);
    }

    const data = {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
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

export default getNamadaTVL;
