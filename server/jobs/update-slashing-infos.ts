import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo } = logger('slashing-nodes-infos');

const updateSlashingInfos = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
      include: { params: true },
    });
    if (!dbChain) {
      logError(`${chainParams.chainId} chain not found in database`);
      continue;
    }
    if (dbChain.ecosystem === 'namada') {
      continue;
    }
    if (dbChain.hasValidators && dbChain.params?.blocksWindow && dbChain.params.blocksWindow != 0) {
      try {
        const slashingNodesInfos = await chainMethods.getMissedBlocks(chainParams, dbChain);
        if (slashingNodesInfos.length > 0) {
          for (const info of slashingNodesInfos) {
            let uptime = ((dbChain.params.blocksWindow - parseInt(info.missed_blocks_counter)) / dbChain.params.blocksWindow) * 100;
            await db.node.updateMany({
              where: { consensusAddress: info.address },
              data: {
                missedBlocks: parseInt(info.missed_blocks_counter),
                uptime: uptime,
              },
            });
          }
        } else {
          logError(`${chainParams.chainId}: no slashing node infos`);
        }
      } catch (e) {
        logError(`Can't fetch slashing infos for ${chainParams.name}:`, e);
      }
    }
    logInfo(`${chainParams.chainId}: infos updated`);
  }
};
export default updateSlashingInfos;
