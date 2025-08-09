import logger from '@/logger';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import { connectWsApi } from '@/server/tools/chains/polkadot/utils/connect-ws-api';
import { getValidatorStake } from '@/server/tools/chains/polkadot/utils/get-validators-stake';


const { logError } = logger('get-tvs-polkadot');

const getTvs: GetTvsFunction = async (chain) => {
  const wsList = chain.nodes.filter((n: any) => n.type === 'ws').map((n: any) => n.url);
  if (!wsList.length) {
    logError(`No ws url for chain '${chain.name}'`);
    return null;
  }
  const api = await connectWsApi(wsList, 3);

  try {
    const totalSupply = await api.query.balances.totalIssuance();

    if (!totalSupply) {
      logError(`No total supply for chain '${chain.name}'`);
      return null;
    }

    const validatorsStake = await getValidatorStake(chain);

    if (validatorsStake.length == 0) {
      logError(`No validators stake for chain '${chain.name}'`);
      return null;
    }

    let bondedTokens = BigInt(0);

    for (const stake of validatorsStake) {
      bondedTokens += BigInt(stake.total);
    }

    const tvs = parseFloat(bondedTokens.toString()) / parseFloat(totalSupply.toString());

    return {
      totalSupply: totalSupply.toString(),
      bondedTokens: bondedTokens.toString(),
      unbondedTokens: '0',
      unbondedTokensRatio: 0,
      tvs,
    };
  } catch (e) {
    logError(`Get TVS for [${chain.name}] error: `, e);
    return null;
  } finally {
    await api.disconnect();
  }
};

export default getTvs;
