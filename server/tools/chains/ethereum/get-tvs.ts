import logger from '@/logger';
import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import getNodes from '@/server/tools/chains/ethereum/get-nodes';

const { logError, logInfo } = logger('get-tvs-ethereum');

const getTvs: GetTvsFunction = async (chain) => {
  try {
    const rpcUrl = chain.nodes.find((n: any) => n.type === 'rpc')?.url;
    if (!rpcUrl) {
      throw new Error('RPC (Execution) URL not provided in chain object');
    }

    const nodes = await getNodes(chain);
    logInfo(`Fetched ${nodes.length} validators for ${chain.name}`);

    const bondedTokens = nodes.filter(node => node.status === 'BOND_STATUS_BONDED')
      .reduce((acc, node) => acc + BigInt(node.tokens), BigInt(0));

    const result = {
      totalSupply: '0',
      bondedTokens: bondedTokens.toString(),
      unbondedTokens: '0',
      unbondedTokensRatio: 0,
      tvs: 0,
    };

    logInfo(`TVS for [${chain.name}]: ${JSON.stringify(result)}`);
    return result;

  } catch (err) {
    logError(`Get TVS for [${chain.name}] error:`, err);
    return null;
  }
};

export default getTvs;
