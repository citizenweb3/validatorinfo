import type { Option } from '@polkadot/types';
import type { ActiveEraInfo } from '@polkadot/types/interfaces';

import logger from '@/logger';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import { connectWsApi } from '@/server/tools/chains/polkadot/utils/connect-ws-api';


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

    const activeEraOpt = (await api.query.staking.activeEra()) as Option<ActiveEraInfo>;
    if (activeEraOpt.isNone) {
      logError(`Active era not available for chain '${chain.name}'`);
      return null;
    }
    const activeEra = activeEraOpt.unwrap().index;
    const erasTotalStakeQuery = (api.query.staking as any).erasTotalStake ?? null;

    if (!erasTotalStakeQuery) {
      logError(`staking.erasTotalStake is not available in this runtime for '${chain.name}'`);
      return null;
    }

    const totalStake = await erasTotalStakeQuery(activeEra);
    const bondedTokens = BigInt(totalStake.toString());

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
    try {
      await api.disconnect();
    } catch (e) {
      logError(`Could not disconnect websocket for ${chain.name}: `, e);
    }
  }
};

export default getTvs;
