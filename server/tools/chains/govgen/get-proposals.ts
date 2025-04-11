import { Amount } from '@cosmostation/extension-client/types/message';

import logger from '@/logger';
import { GetProposalsFunction, ProposalsResult, ResultProposalItem } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

import { $Enums } from '.prisma/client';

import ProposalStatus = $Enums.ProposalStatus;

const { logInfo, logError } = logger('get-proposals-govgen');

interface TallyResult {
  yes: string;
  no: string;
  no_with_veto: string;
  abstain: string;
}

interface ProposalContent {
  type: string;
  value: {
    title: string;
    description: string;
  };
}

interface ChainProposal {
  id: string;
  content: ProposalContent;
  status: number;
  final_tally_result: TallyResult;
  submit_time: string;
  deposit_end_time: string;
  total_deposit: Amount[];
  voting_start_time: string;
  voting_end_time: string;
}

const statusMap: Record<number, ProposalStatus> = {
  1: ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD,
  2: ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD,
  3: ProposalStatus.PROPOSAL_STATUS_PASSED,
  4: ProposalStatus.PROPOSAL_STATUS_REJECTED,
  5: ProposalStatus.PROPOSAL_STATUS_FAILED,
  // Добавь другие статусы, если они используются в Govgen
};

const getGovgenProposals: GetProposalsFunction = async (chain) => {
  const restEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url || 'https://api.govgen.citizenweb3.com';

  const result: ProposalsResult = {
    proposals: [] as ResultProposalItem[],
    total: 0,
    live: 0,
    passed: 0,
  };

  if (restEndpoint) {
    try {
      let allProposals: ResultProposalItem[] = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const url = `${restEndpoint}/gov/proposals?limit=${limit}&page=${page}`;
        logInfo(url);
        try {
          const response = await fetchData<{
            height: string;
            result: ChainProposal[];
          }>(url);

          const proposalsPromises = response.result.map(async (proposal) => {
            const status = statusMap[proposal.status] || ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;

            if (status === ProposalStatus.PROPOSAL_STATUS_PASSED) {
              result.passed += 1;
            }
            if (status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
              result.live += 1;
            }

            const title = proposal.content?.value?.title || 'Unknown title';
            const description = proposal.content?.value?.description || 'Unknown description';
            let tallyResult = '';

            // Получаем промежуточный tally для предложений в процессе голосования
            if (status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
              try {
                const tallyResponse = await fetchData<{
                  height: string;
                  result: TallyResult;
                }>(`${restEndpoint}/gov/proposals/${proposal.id}/tally`);
                tallyResult = JSON.stringify(tallyResponse.result);
              } catch (tallyError) {
                logError(`Error fetching tally for proposal ${proposal.id}`, tallyError);
                tallyResult = ''; // Оставляем пустым в случае ошибки
              }
            }

            return {
              type: proposal.content?.type || 'Unknown type',
              proposalId: proposal.id,
              status,
              submitTime: proposal.submit_time,
              depositEndTime: proposal.deposit_end_time,
              votingStartTime: proposal.voting_start_time,
              votingEndTime: proposal.voting_end_time,
              tallyResult, // Заполняется для предложений в процессе голосования
              finalTallyResult: JSON.stringify(proposal.final_tally_result) || '',
              content: JSON.stringify(proposal.content) || '',
              title,
              description,
            };
          });

          const proposals = await Promise.all(proposalsPromises);
          allProposals.push(...proposals);

          logInfo(`Fetched ${proposals.length} Proposals for ${chain.name}, page: ${page}`);

          // Если вернулось меньше, чем limit, это последняя страница
          if (proposals.length < limit) {
            hasMore = false;
          } else {
            page += 1;
          }
        } catch (error) {
          console.error(`Error fetching proposals ${chain.name}`, error);
          break;
        }
      }

      return {
        ...result,
        proposals: allProposals,
        total: allProposals.length,
      };
    } catch (e) {
      logError(`Error fetching proposals for ${chain.name}`, e);
    }
  }

  return result;
};

export default getGovgenProposals;
