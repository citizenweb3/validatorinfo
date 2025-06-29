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
        return { address: stash.toString(), total: '', own: '' };
      }

      const exposure = exposureOption.unwrap();

      return {
        address: stash.toString(),
        total: exposure?.total ? exposure.total.toString() : '',
        own: exposure?.own ? exposure.own.toString() : '',
      };
    });

    return decoded;
  } finally {
    await api.disconnect();
  }
};
