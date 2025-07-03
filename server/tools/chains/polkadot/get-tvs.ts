import { GetTvsFunction } from '@/server/tools/chains/chain-indexer';

const getTvs: GetTvsFunction = async (chain) => {
  return {
    totalSupply: '0',
    bondedTokens: '0',
    unbondedTokens: '0',
    unbondedTokensRatio: 0,
    tvs: 0,
  };
};

export default getTvs;
