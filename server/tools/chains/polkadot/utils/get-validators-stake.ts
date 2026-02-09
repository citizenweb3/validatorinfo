import type { ApiPromise } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { ActiveEraInfo } from '@polkadot/types/interfaces';

import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import { connectWsApi } from '@/server/tools/chains/polkadot/utils/connect-ws-api';

const { logError } = logger('polkadot-validator-stake');

interface ValidatorStake {
  address: string;
  total: string;
  own: string;
}

interface ChainNode {
  type: string;
  url: string;
}

export const getValidatorStake = async (chain: AddChainProps, providedApi?: ApiPromise): Promise<ValidatorStake[]> => {
  let api: ApiPromise;
  let shouldDisconnect = false;

  if (providedApi) {
    api = providedApi;
  } else {
    const wsList = chain.nodes.filter((n: ChainNode) => n.type === 'ws').map((n: ChainNode) => n.url);

    if (!wsList.length) {
      logError(`No ws url for chain '${chain.name}'`);
      return [];
    }

    api = await connectWsApi(wsList, 3);
    shouldDisconnect = true;
  }

  try {
    const activeEraRaw = (await api.query.staking.activeEra()) as Option<ActiveEraInfo>;

    if (activeEraRaw.isNone) {
      return [];
    }

    const activeEra = activeEraRaw.unwrap();
    const eraIndex = activeEra.index.toNumber();

    const validators = await api.query.staking.erasStakersOverview.entries(eraIndex);

    return validators.map(([key, opt]) => {
      const [, stash] = key.args;
      const optTyped = opt as any as Option<any>;

      if (optTyped.isNone) {
        return { address: stash.toString(), total: '', own: '' };
      }

      const metadata = optTyped.unwrap();

      return {
        address: stash.toString(),
        total: metadata.total.toString(),
        own: metadata.own.toString(),
      };
    });
  } catch (e) {
    logError(`Get validator stake for [${chain.name}] error:`, e);
    return [];
  } finally {
    if (shouldDisconnect) {
      try {
        await api.disconnect();
      } catch (e) {
        logError(`Could not disconnect websocket for ${chain.name}:`, e);
      }
    }
  }
};
