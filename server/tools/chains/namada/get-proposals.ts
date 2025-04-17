import logger from '@/logger';
import { GetProposalsFunction, ProposalsResult, ResultProposalItem } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

import { $Enums } from '.prisma/client';

const { logInfo, logError } = logger('get-proposals');

interface NamadaProposal {
  id: string;
  content: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  activationTime: string;
  yayVotes: string;
  nayVotes: string;
  abstainVotes: string;
  data: string | null;
}

interface ProposalContent {
  title?: string;
  abstract?: string;
  details?: string;
  authors?: string;
  [key: string]: any;
}

const getProposals: GetProposalsFunction = async (chain) => {
  const indexerEndpoint = chain.nodes.find((node) => node.type === 'indexer')?.url;
  const result: ProposalsResult = {
    proposals: [],
    total: 0,
    live: 0,
    passed: 0,
  };

  if (!indexerEndpoint) {
    logError(`No REST endpoint found for ${chain.name}`);
    return result;
  }

  try {
    let allProposals: ResultProposalItem[] = [];
    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const url = `${indexerEndpoint}/api/v1/gov/proposal?page=${currentPage}`;
      logInfo(url);

      const response = await fetchData<{
        results: NamadaProposal[];
        pagination: { totalPages: string };
      }>(url);

      const proposals: ResultProposalItem[] = response.results.map((proposal) => {
        let content: ProposalContent;
        try {
          content = JSON.parse(proposal.content);
        } catch (e) {
          logError(`Error parsing content for proposal ${proposal.id}: ${e}`);
          content = { title: 'Unknown title', details: 'Unknown details' };
        }

        let status: $Enums.ProposalStatus;
        switch (proposal.status) {
          case 'passed':
            status = $Enums.ProposalStatus.PROPOSAL_STATUS_PASSED;
            result.passed += 1;
            break;
          case 'rejected':
            status = $Enums.ProposalStatus.PROPOSAL_STATUS_REJECTED;
            break;
          default:
            status = $Enums.ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;
        }

        const submitTime = new Date(parseInt(proposal.startTime) * 1000).toISOString();
        const votingStartTime = submitTime;
        const votingEndTime = new Date(parseInt(proposal.endTime) * 1000).toISOString();
        const depositEndTime = submitTime;

        const tallyResult = JSON.stringify({
          yes: proposal.yayVotes,
          no: proposal.nayVotes,
          no_with_veto: '0',
          abstain: proposal.abstainVotes,
        });

        const finalTallyResult =
          status === $Enums.ProposalStatus.PROPOSAL_STATUS_PASSED ||
          status === $Enums.ProposalStatus.PROPOSAL_STATUS_REJECTED
            ? tallyResult
            : {
                yes_count: '0',
                no_count: '0',
                no_with_veto_count: '0',
                abstain_count: '0',
              };

        return {
          type: proposal.type || 'Unknown type',
          proposalId: proposal.id,
          status,
          submitTime,
          depositEndTime,
          votingStartTime,
          votingEndTime,
          tallyResult,
          finalTallyResult,
          content: JSON.stringify(proposal.content),
          title: content.title || 'Unknown title',
          description: content.details || content.abstract || 'Unknown description',
        };
      });

      allProposals.push(...proposals);
      totalPages = parseInt(response.pagination.totalPages, 10);
      currentPage += 1;

      logInfo(`Fetched ${proposals.length} proposals for ${chain.name}, page ${currentPage}/${totalPages}`);
    }

    return {
      ...result,
      proposals: allProposals,
      total: allProposals.length,
    };
  } catch (e) {
    logError(`Error fetching proposals for ${chain.name}: ${e}`);
    return result;
  }
};

export default getProposals;
