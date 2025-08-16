import logger from '@/logger';
import { AddChainProps, GetCirculatingTokensPublic } from '@/server/tools/chains/chain-indexer';
import { bigIntPow } from '@/server/utils/bigint-pow';

const { logError } = logger('neutron-circulating-tokens-public');

const getCirculatingTokensPublic: GetCirculatingTokensPublic = async (chain: AddChainProps) => {
  try {
    const response = await fetch('https://info.neutron.org/v1/circulating_supply');
    if (response.ok) {
      const data = await response.json();
      if (data && data.circulating_supply) {
        return String(data.circulating_supply).split('.')[0];
      }
    }
  } catch (e) {
    logError(`Can't fetch public circulating supply (json) for ${chain.name}`, e);
  }

  try {
    const response = await fetch('https://info.neutron.org/v1/circulating_supply_plain');
    if (response.ok) {
      const text = await response.text();
      if (text) {
        const circSupply = BigInt(String(text).split('.')[0]);
        return String(circSupply * bigIntPow(BigInt(10), BigInt(chain.coinDecimals)));
      }
    }
  } catch (e) {
    logError(`Can't fetch public circulating supply (plain) for ${chain.name}`, e);
  }

  logError(`Can't fetch public circulating supply for ${chain.name} (both endpoints failed)`);
  return null;
};

export default getCirculatingTokensPublic;
