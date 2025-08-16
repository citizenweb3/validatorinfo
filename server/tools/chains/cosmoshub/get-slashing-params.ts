import logger from '@/logger';
import { GetSlashingParamsFunction, SlashingChainParams } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

interface ChainSlashingParams {
  params: {
    signed_blocks_window: number,
    downtime_jail_duration: string,
  };
}

const { logInfo, logError } = logger('get-slashing-params');

const getSlashingParams: GetSlashingParamsFunction = async (chain) => {
  const result: SlashingChainParams = {
    blocksWindow: null,
    jailedDuration: null,
  };

  try {
    const slashingParamsResult = await fetchChainData<ChainSlashingParams>(
      chain.name,
      'rest',
      '/cosmos/slashing/v1beta1/params',
    );
    if (slashingParamsResult?.params?.signed_blocks_window) {
      result.blocksWindow = Number(slashingParamsResult.params.signed_blocks_window);
      result.jailedDuration = slashingParamsResult.params.downtime_jail_duration;
      logInfo(`Slashing params for ${chain.name}: ${JSON.stringify(result)}`);
    }
    return result;
  } catch (e) {
    logError(`Error fetching slashing params for ${chain.name}`, e);
  }

  return result;
};

export default getSlashingParams;
