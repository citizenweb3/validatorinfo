import { Amount } from '@cosmostation/extension-client/types/message';

import logger from '@/logger';
import { GetProposalsFunction, ProposalsResult, ResultProposalItem } from '@/server/tools/chains/chain-indexer';
import fetchData from '@/server/utils/fetch-data';

import { $Enums } from '.prisma/client';

import ProposalStatus = $Enums.ProposalStatus;

const { logInfo, logError } = logger('get-proposals');

interface TallyResult {
  yes: string;
  no: string;
  no_with_veto: string;
  abstain: string;
}

interface ProposalContent {
  '@type': string;
  title: string;
  description: string;
  [key: string]: any;
}

interface ProposalMessage {
  '@type': string;
  content?: ProposalContent;
  [key: string]: any;
}

interface ChainProposal {
  id: string;
  status: ProposalStatus;
  submit_time: string;
  deposit_end_time: string;
  voting_start_time: string;
  voting_end_time: string;
  final_tally_result?: TallyResult;
  messages: ProposalMessage[];
  content?: ProposalContent;
  title: string;
  summary: string;
  total_deposit: Amount[];
  metadata?: string;
}

const getProposals: GetProposalsFunction = async (chain) => {
  const restEndpoint = chain.nodes.find((node) => node.type === 'lcd')?.url;

  const result: ProposalsResult = {
    proposals: [] as ResultProposalItem[],
    total: 0,
    live: 0,
    passed: 0,
  };

  if (restEndpoint) {
    try {
      let allProposals: ResultProposalItem[] = [];
      let currentKey: string | null = null;
      const url = `${restEndpoint}/cosmos/gov/v1/proposals?pagination.limit=100`;

      while (true) {
        let requestUrl = url;
        if (currentKey) {
          requestUrl += `&pagination.key=${encodeURIComponent(currentKey)}`;
        }
        logInfo(requestUrl);

        try {
          const response = await fetchData<{
            proposals: ChainProposal[];
            pagination: {
              next_key: string | null;
            };
          }>(requestUrl);

          const proposalsPromises = response.proposals.map(async (proposal) => {
            if (proposal.status === ProposalStatus.PROPOSAL_STATUS_PASSED) {
              result.passed += 1;
            }
            if (proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
              result.live += 1;
            }

            const title =
              proposal.title || proposal.content?.title || proposal.messages[0]?.content?.title || 'Unknown title';

            const description =
              proposal.summary ||
              proposal.content?.description ||
              proposal.messages[0]?.content?.description ||
              'Unknown description';

            let tallyResult = '';

            // Получаем промежуточный tally для предложений в процессе голосования
            if (proposal.status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
              try {
                const tallyResponse = await fetchData<{
                  tally: TallyResult;
                }>(`${restEndpoint}/cosmos/gov/v1/proposals/${proposal.id}/tally`);
                tallyResult = JSON.stringify(tallyResponse.tally);
              } catch (tallyError) {
                logError(`Error fetching tally for proposal ${proposal.id}`, tallyError);
                tallyResult = ''; // Оставляем пустым в случае ошибки
              }
            }

            return {
              type: (proposal.messages[0]?.['@type'] as string) || 'Unknown type',
              proposalId: proposal.id,
              status: proposal.status,
              submitTime: proposal.submit_time,
              depositEndTime: proposal.deposit_end_time,
              votingStartTime: proposal.voting_start_time,
              votingEndTime: proposal.voting_end_time,
              tallyResult, // Заполняется для предложений в процессе голосования
              finalTallyResult: JSON.stringify(proposal.final_tally_result) || '',
              content: JSON.stringify(proposal.messages[0]) || (proposal.metadata as string),
              title,
              description,
            };
          });

          const proposals = await Promise.all(proposalsPromises);
          allProposals.push(...proposals);

          logInfo(
            `Fetched ${proposals.length} Proposals for ${chain.name}, next_key: ${response.pagination?.next_key}`,
          );

          if (response.pagination && response.pagination.next_key) {
            currentKey = response.pagination.next_key;
          } else {
            break;
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

export default getProposals;
