import logger from '@/logger';
import { type GetNodesFunction, type GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import getNodes from '@/server/tools/chains/ethereum/get-nodes';
import { getEthereumTotalSupply } from '@/server/tools/chains/ethereum/get-total-supply';

const { logError, logInfo } = logger('get-tvs-ethereum');
const ETHEREUM_MAINNET_NAME = 'ethereum';

interface EthereumTvsDependencies {
  getNodes: GetNodesFunction;
  getTotalSupply: () => Promise<string | null>;
}

export const createEthereumTvsGetter =
  ({ getNodes: getNodesForChain, getTotalSupply }: EthereumTvsDependencies): GetTvsFunction =>
  async (chain) => {
    try {
      const isMainnet = chain.name === ETHEREUM_MAINNET_NAME;
      const totalSupply = isMainnet ? await getTotalSupply() : '0';

      if (totalSupply === null) {
        logError(`Total supply for [${chain.name}] is unavailable; preserving the previous TVS snapshot`);
        return null;
      }

      const nodes = await getNodesForChain(chain);
      if (nodes.length === 0) {
        logError(`No validators returned for [${chain.name}]; preserving the previous TVS snapshot`);
        return null;
      }

      logInfo(`Fetched ${nodes.length} validators for ${chain.name}`);

      const bondedTokens = nodes
        .filter((node) => node.status === 'BOND_STATUS_BONDED')
        .reduce((acc, node) => acc + BigInt(node.tokens), BigInt(0));
      const totalSupplyWei = BigInt(totalSupply);

      if (isMainnet && (bondedTokens <= BigInt(0) || bondedTokens > totalSupplyWei)) {
        logError(`Invalid bonded token total for [${chain.name}]; preserving the previous TVS snapshot`);
        return null;
      }

      const unbondedTokens = totalSupplyWei > bondedTokens ? totalSupplyWei - bondedTokens : BigInt(0);
      const tvs = totalSupplyWei > BigInt(0) ? Number(bondedTokens) / Number(totalSupplyWei) : 0;

      if (isMainnet && (!Number.isFinite(tvs) || tvs <= 0 || tvs > 1)) {
        logError(`Invalid TVS ratio for [${chain.name}]; preserving the previous TVS snapshot`);
        return null;
      }

      const result = {
        totalSupply,
        bondedTokens: bondedTokens.toString(),
        unbondedTokens: unbondedTokens.toString(),
        unbondedTokensRatio: totalSupplyWei > BigInt(0) ? 1 - tvs : 0,
        tvs,
      };

      logInfo(`TVS for [${chain.name}]: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      logError(`Get TVS for [${chain.name}] error:`, err);
      return null;
    }
  };

const getTvs = createEthereumTvsGetter({
  getNodes,
  getTotalSupply: getEthereumTotalSupply,
});

export default getTvs;
