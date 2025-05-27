import logger from '@/logger';
import { GetMissedBlocks } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';
import { SlashingSigningInfos } from '@/server/types';

const { logError } = logger('slashing-nodes-infos');

interface SlashingInfos {
  info: SlashingSigningInfos[];
}

const getMissedBlocks: GetMissedBlocks = async (chain) => {
  const slashingInfosUrl = `/cosmos/slashing/v1beta1/signing_infos?pagination.limit=10000&pagination.count_total=false`;

  try {
    return (await fetchChainData<SlashingInfos>(chain.name, 'rest', slashingInfosUrl)).info;
  } catch (e) {
    logError(`Can't fetch cosmos nodes: ${slashingInfosUrl}`, e);
    return [];
  }
};

export default getMissedBlocks;
