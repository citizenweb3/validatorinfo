import { ApiPromise, WsProvider } from '@polkadot/api';
import { Option } from '@polkadot/types';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import logger from '@/logger';

const { logError } = logger('polkadot-validator-stake');

const connectWsApi = async (wsUrls: string[]): Promise<ApiPromise> => {
  let lastError: any = null;

  for (const url of wsUrls) {
    let provider: WsProvider | null = null;
    try {
      provider = new WsProvider(url, 10000);
      const api = await ApiPromise.create({ provider });
      await api.isReadyOrError;
      return api;
    } catch (e) {
      lastError = e;
      if (provider) {
        try {
          provider.disconnect();
        } catch (e) {
          logError(`Can't disconnect with url ${url}`);
        }
      }
    }
  }
  throw lastError || new Error(`Can't connect to every url`);
};

export const getValidatorStake = async (chain: AddChainProps) => {
  const wsList = chain.nodes.filter((n: any) => n.type === 'ws').map((n: any) => n.url);
  if (!wsList.length) {
    logError(`No ws url for chain '${chain.name}'`);
  }

  const api = await connectWsApi(wsList);

  const activeEra = (await api.query.staking.activeEra()).toJSON();
  const eraIndex = typeof activeEra === 'object' && activeEra !== null
    ? (activeEra as any).index ?? activeEra
    : activeEra;

  const validators = await api.query.staking.erasStakersOverview.entries(Number(eraIndex));

  const decoded: {
    stash: string;
    total: string;
    own: string;
  }[] = [];

  for (const [key, opt] of validators) {
    const [, stash] = key.args;

    const exposureOption = opt as Option<any>;
    if (exposureOption.isNone) {
      decoded.push({
        stash: stash.toString(),
        total: '0',
        own: '0',
      });
      continue;
    }

    const exposure = exposureOption.unwrap();
    const human = exposure.toHuman?.() || {};

    decoded.push({
      stash: stash.toString(),
      total: human.total ?? '0',
      own: human.own ?? '0',
    });
  }

  await api.disconnect();
  return decoded;
};
