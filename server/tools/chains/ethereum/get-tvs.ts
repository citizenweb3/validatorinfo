import logger from '@/logger';
import { type GetNodesFunction, type GetTvsFunction } from '@/server/tools/chains/chain-indexer';
import getNodes from '@/server/tools/chains/ethereum/get-nodes';
import { getEthereumTotalSupply } from '@/server/tools/chains/ethereum/get-total-supply';
import streamBeaconValidators from '@/server/tools/chains/ethereum/stream-beacon-validators';

const { logError, logInfo } = logger('get-tvs-ethereum');
const ETHEREUM_MAINNET_NAME = 'ethereum';

interface EthereumTvsDependencies {
  getNodes: GetNodesFunction;
  getTotalSupply: () => Promise<string | null>;
  /** Mainnet only: bonded wei folded from the streamed Beacon validator set. */
  getBondedWei: (chain: Parameters<GetTvsFunction>[0]) => Promise<string | null>;
}

export const createEthereumTvsGetter =
  ({ getNodes: getNodesForChain, getTotalSupply, getBondedWei }: EthereumTvsDependencies): GetTvsFunction =>
  async (chain) => {
    try {
      const isMainnet = chain.name === ETHEREUM_MAINNET_NAME;
      const totalSupply = isMainnet ? await getTotalSupply() : '0';

      if (totalSupply === null) {
        logError(`Total supply for [${chain.name}] is unavailable; preserving the previous TVS snapshot`);
        return null;
      }

      // Total supply does not depend on the validator set: FDV is supply * price.
      // Staking figures degrade to zero when the validator set is unavailable;
      // supply does not.
      //
      // Mainnet folds bonded stake from the streamed Beacon set rather than from
      // getNodes: the response is ~1 GB and per-node indexing of ~890k validators
      // is not viable, so getNodes deliberately returns nothing for mainnet.
      const totalSupplyWei = BigInt(totalSupply);

      let rawBondedTokens = BigInt(0);
      if (isMainnet) {
        const bondedWei = await getBondedWei(chain);
        if (bondedWei === null) {
          logError(`Bonded stake for [${chain.name}] is unavailable; reporting supply without staking figures`);
        } else {
          rawBondedTokens = BigInt(bondedWei);
        }
      } else {
        const nodes = await getNodesForChain(chain);
        if (nodes.length === 0) {
          logError(`No validators returned for [${chain.name}]; reporting supply without staking figures`);
        } else {
          logInfo(`Fetched ${nodes.length} validators for ${chain.name}`);
        }
        rawBondedTokens = nodes
          .filter((node) => node.status === 'BOND_STATUS_BONDED')
          .reduce((acc, node) => acc + BigInt(node.tokens), BigInt(0));
      }

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

const beaconValidatorsUrl = (chain: Parameters<GetTvsFunction>[0]): string | null => {
  const restUrl = chain.nodes.find((node: { type: string }) => node.type === 'rest')?.url;
  if (!restUrl) return null;
  const base = restUrl.endsWith('/') ? restUrl : `${restUrl}/`;
  return new URL('eth/v1/beacon/states/head/validators', base).toString();
};

const getBondedWeiFromBeacon = async (chain: Parameters<GetTvsFunction>[0]): Promise<string | null> => {
  const url = beaconValidatorsUrl(chain);
  if (!url) {
    logError(`Chain ${chain.name}: REST (Beacon) URL not provided`);
    return null;
  }

  const summary = await streamBeaconValidators(url);
  return summary?.bondedWei ?? null;
};

const getTvs = createEthereumTvsGetter({
  getNodes,
  getTotalSupply: getEthereumTotalSupply,
  getBondedWei: getBondedWeiFromBeacon,
});

export default getTvs;
