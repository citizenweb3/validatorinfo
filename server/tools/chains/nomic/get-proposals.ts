import { GetProposalsFunction, ProposalsResult, ResultProposalItem } from '@/server/tools/chains/chain-indexer';

export const getProposals: GetProposalsFunction = async (_) => {
  const result: ProposalsResult = {
    proposals: [] as ResultProposalItem[],
    total: 0,
    live: 0,
    passed: 0,
  };

  return result;
};

export default getProposals;
