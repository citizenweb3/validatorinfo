import logger from '@/logger';
import { GetProposalParams, ProposalParams } from '@/server/tools/chains/chain-indexer';
import { getPosParams } from '@/server/tools/chains/namada/utils/get-pos-params';

const { logError } = logger('get-proposal-params');

const getProposalParams: GetProposalParams = async (chain) => {
  const result: ProposalParams = {
    creationCost: null,
    votingPeriod: null,
    participationRate: null,
    quorumThreshold: null,
  };

  try {
    const posParams = await getPosParams(chain.name);
    result.votingPeriod = posParams ? `${posParams.max_proposal_period}epochs` : null;
  } catch (e) {
    logError(`Error fetching proposal params for ${chain.name}`, e);
  }
  return result;
};

export default getProposalParams;
