import { GetSlashingParamsFunction, SlashingChainParams } from '@/server/tools/chains/chain-indexer';

const getSlashingParams: GetSlashingParamsFunction = async (chain) => {
  const result: SlashingChainParams = {
    blocksWindow: 320,
    jailedDuration: null,
  };
  return result;
};

export default getSlashingParams;
