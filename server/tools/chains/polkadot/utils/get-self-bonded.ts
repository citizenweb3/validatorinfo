import logger from '@/logger';
import { AddChainProps } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('polkadot-get-self-bonded');

interface SelfBondedAmount {
  staking: {
    total: string;
  };
}

export const getSelfBonded = async (chain: AddChainProps, address: string) => {
  const selfBondedAmount = await fetchChainData<SelfBondedAmount>(
    chain.name,
    'rest',
    `/accounts/${address}/staking-info`,
  );

  if (!selfBondedAmount) {
    logError(`Self bonded for ${address} not found.`);
    return null;
  }
  return selfBondedAmount.staking.total;
};