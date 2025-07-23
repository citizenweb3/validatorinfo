import logger from '@/logger';
import { GetActiveSetMinAmount } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';
import { bigIntPow } from '@/server/utils/bigint-pow';

const { logError } = logger('cosmos-min-amount-active-set');

const getActiveSetMinAmount: GetActiveSetMinAmount = async (chain) => {
  try {
    let minVotingPower: bigint | null = null;
    const limit = 100;
    let offset = 0;
    let total: number | null = null;

    while (total === null || offset < total) {
      const params = new URLSearchParams({
        'pagination.limit': limit.toString(),
        'pagination.offset': offset.toString(),
      });

      const url = `/cosmos/base/tendermint/v1beta1/validatorsets/latest?${params.toString()}`;
      const response = await fetchChainData<{
        validators: { voting_power: string }[];
        pagination: { total: string | null };
      }>(chain.name, 'rest', url);

      if (total === null && response.pagination.total) {
        total = Number(response.pagination.total);
      }

      for (const val of response.validators) {
        const power = BigInt(val.voting_power);
        if (minVotingPower === null || power < minVotingPower) {
          minVotingPower = power;
        }
      }
      offset += limit;
    }

    if (chain.name === 'likecoin') {
      return minVotingPower !== null
        ? BigInt((minVotingPower * bigIntPow(BigInt(10), BigInt(chain.coinDecimals))) / BigInt(1000)).toString()
        : null;
    }
    return minVotingPower !== null
      ? (BigInt(minVotingPower) * bigIntPow(BigInt(10), BigInt(chain.coinDecimals))).toString()
      : null;
  } catch (e) {
    logError(`${chain.name} Can't fetch active set min amount: `, e);
    return null;
  }
};

export default getActiveSetMinAmount;
