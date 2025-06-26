import { Option } from '@polkadot/types';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import logger from '@/logger';
import { Exposure } from '@polkadot/types/interfaces';
import { connectWsApi } from '@/server/tools/chains/polkadot/utils/connect-ws-api';

const { logError } = logger('polkadot-validator-stake');

export const getValidatorStake = async (chain: AddChainProps) => {
  const wsList = chain.nodes.filter((n: any) => n.type === 'ws').map((n: any) => n.url);
  if (!wsList.length) {
    logError(`No ws url for chain '${chain.name}'`);
    return [];
  }

  const api = await connectWsApi(wsList, 3);

  try {
    const activeEraRaw = await api.query.staking.activeEra();
    const activeEra = activeEraRaw.toJSON();
    const eraIndex = typeof activeEra === 'object' && activeEra !== null
      ? (activeEra as any).index ?? activeEra
      : activeEra;

    if (typeof eraIndex !== 'number') {
      logError(`Invalid activeEra: ${JSON.stringify(activeEra)}`);
      return [];
    }

    const validators = await api.query.staking.erasStakersOverview.entries(eraIndex);

    const decoded = validators.map(([key, opt]) => {
      const [, stash] = key.args;
      const exposureOption = opt as Option<Exposure>;

      if (exposureOption.isNone) {
        return { address: stash.toString(), total: '0', own: '0' };
      }

      const exposure = exposureOption.unwrap();
      const human = typeof exposure.toHuman === 'function'
        ? exposure.toHuman()
        : exposure.toJSON();

      return {
        address: stash.toString(),
        total: human?.total != null ? human.total.toString() : '0',
        own: human?.own != null ? human.own.toString() : '0',
      };
    });

    return decoded;
  } finally {
    await api.disconnect();
  }
};
