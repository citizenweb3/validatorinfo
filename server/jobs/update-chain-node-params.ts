import db from '@/db';
import logger from '@/logger';
import getChainMethods from '@/server/tools/chains/methods';
import { getChainParams } from '@/server/tools/chains/params';

const { logError, logInfo, logDebug } = logger('get-node-params');

const updateChainNodeParams = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);
    const chainMethods = getChainMethods(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        return null;
      }

      logInfo(`${chainName} updating`);
      const params = await chainMethods.getNodeParams(chainParams);
      logDebug(`${chainName} Node params: ${JSON.stringify(params)}`);

      const existingChain = await db.chain.findUnique({
        where: { id: dbChain.id },
      });

      if (existingChain) {
        await db.chain.update({
          where: { id: dbChain.id },
          data: {
            peers: params.peers ? params.peers : existingChain.peers,
            seeds: params.seeds ? params.seeds : existingChain.seeds,
            binaries: params.binaries ? params.binaries : existingChain.binaries,
            genesis: params.genesis ? params.genesis : existingChain.genesis,
            keyAlgos: params.keyAlgos ? params.keyAlgos : existingChain.keyAlgos,
            daemonName: params.daemonName ? params.daemonName : existingChain.daemonName,
            nodeHome: params.nodeHome ? params.nodeHome : existingChain.nodeHome,
          },
        });
      }
    } catch (e) {
      logError("Can't fetch node params: ", e);
    }
  }
};

export default updateChainNodeParams;
