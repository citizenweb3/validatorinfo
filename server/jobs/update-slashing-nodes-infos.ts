import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError } = logger('slashing-nodes-infos');

const updateSlashingNodesInfos = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    const dbChain = await db.chain.findFirst({
      where: { chainId: chainParams.chainId },
    });
    if (!dbChain) {
      logError(`${chainParams.chainId} chain not found in database`);
      continue;
    }
    if (dbChain.hasValidators && dbChain.blocksWindow && dbChain.blocksWindow != 0) {
      try {
        const slashingNodesInfos = await chainMethods.getSlashingNodesInfos(chainParams);
        if (slashingNodesInfos.length > 0) {
          for (const info of slashingNodesInfos) {
            let uptime = ((dbChain.blocksWindow - parseInt(info.missed_blocks_counter)) / dbChain.blocksWindow) * 100

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
  }
};
export default updateSlashingNodesInfos;
