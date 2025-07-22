import logger from '@/logger';
import { GetActiveSetMinAmount } from '@/server/tools/chains/chain-indexer';
import { getPosParams } from '@/server/tools/chains/namada/utils/get-pos-params';
import fetchChainData from '@/server/tools/get-chain-data';
import { bigIntPow } from '@/server/utils/bigint-pow';

const { logError } = logger('namada-min-amount-active-set');

const getActiveSetMinAmount: GetActiveSetMinAmount = async (chain) => {
  try {
    const posParams = await getPosParams(chain.name);

    if (!posParams) {
      logError(`${chain.name} No pos params found, getting from db`);
      return null;
    }

    const response = await fetchChainData<
      {
        voting_power: string;
        rank: number | null;
      }[]
    >(chain.name, 'indexer', `/api/v1/pos/validator/all`);

    let minVotingPower: bigint | null = null;
    for (const validator of response) {
      if (
        validator.rank !== null &&
        validator.voting_power &&
        validator.rank <= Number(posParams.max_validator_slots)
      ) {
        const votingPower = Number(validator.voting_power);
        if (minVotingPower === null || votingPower < minVotingPower) {
          minVotingPower = BigInt(votingPower);
        }
      }
    }

    if (minVotingPower !== null) {
      return String(BigInt(minVotingPower) * bigIntPow(BigInt(10), BigInt(chain.coinDecimals)));
    } else {
      return String(posParams.validator_stake_threshold);
    }
  } catch (e) {
    logError(`Error fetching staking params for ${chain.name}`, e);
    return null;
  }
};

export default getActiveSetMinAmount;
