import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensPublic } from '@/server/tools/chains/chain-indexer';

const { logError } = logger('nym-circulating-tokens-public');

const getCirculatingTokensPublic: GetCirculatingTokensPublic = async (chain: AddChainProps) => {
  const response = await fetch('https://validator.nymtech.net/api/v1/circulating-supply');
  const data = await response.json();

  if (!data) {
    logError(`Can't fetch public circulating supply for ${chain.name}`);
    return null;
  }
  return data.circulating_supply.amount;
};

export default getCirculatingTokensPublic;
