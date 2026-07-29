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

      // Total supply does not depend on the validator set: FDV is supply * price.
      // The Beacon endpoint currently fails for mainnet (its active-validator response
      // exceeds the V8 string limit), and letting that failure abort the whole snapshot
      // is what kept Tokenomics.total_supply empty and Tokenomics.fdv at 0. Staking
      // figures degrade to zero when the validator set is unavailable; supply does not.
      const nodes = await getNodesForChain(chain);
      const totalSupplyWei = BigInt(totalSupply);

      if (nodes.length === 0) {
        logError(`No validators returned for [${chain.name}]; reporting supply without staking figures`);
      } else {
        logInfo(`Fetched ${nodes.length} validators for ${chain.name}`);
      }

      const rawBondedTokens = nodes
        .filter((node) => node.status === 'BOND_STATUS_BONDED')
        .reduce((acc, node) => acc + BigInt(node.tokens), BigInt(0));

      // Bonded stake above total supply is impossible; treat it as missing rather than
      // publishing a ratio greater than 1.
      const bondedExceedsSupply = totalSupplyWei > BigInt(0) && rawBondedTokens > totalSupplyWei;
      if (bondedExceedsSupply) {
        logError(`Bonded tokens exceed total supply for [${chain.name}]; dropping the staking figures`);
      }

      const bondedTokens = bondedExceedsSupply ? BigInt(0) : rawBondedTokens;
      const unbondedTokens = totalSupplyWei > bondedTokens ? totalSupplyWei - bondedTokens : BigInt(0);
      const tvs = totalSupplyWei > BigInt(0) ? Number(bondedTokens) / Number(totalSupplyWei) : 0;

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
