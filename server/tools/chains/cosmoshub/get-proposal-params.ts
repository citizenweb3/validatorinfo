import logger from '@/logger';
import { GetProposalParams, ProposalParams } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';

export interface ChainProposalParams {
  deposit_params: {
    min_deposit: {
      amount: string;
    }[];
  };
  params: {
    voting_period: string;
    quorum: string;
    threshold: string;
  };
}

const { logInfo, logError } = logger('get-proposal-params');

const getProposalParams: GetProposalParams = async (chain) => {
  const result: ProposalParams = {
    creationCost: null,
    votingPeriod: null,
    participationRate: null,
    quorumThreshold: null,
  };

  try {
    const proposalParamsResult = await fetchChainData<ChainProposalParams>(
      chain.name,
      'rest',
      '/cosmos/gov/v1/params/deposit',
    );
    if (proposalParamsResult?.deposit_params?.min_deposit) {
      result.creationCost = Number(BigInt(proposalParamsResult.deposit_params.min_deposit[0].amount) / BigInt(10 ** chain.coinDecimals));
      result.votingPeriod = proposalParamsResult.params.voting_period;
      result.participationRate = Number(proposalParamsResult.params.quorum);
      result.quorumThreshold = Number(proposalParamsResult.params.threshold);

      logInfo(`Proposal params for ${chain.name}: ${JSON.stringify(result)}`);
    }
    return result;
  } catch (e) {
    logError(`Error fetching proposal params for ${chain.name}`, e);
  }

  return result;
};

export default getProposalParams;
