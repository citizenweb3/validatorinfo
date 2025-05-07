import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

import logger from '@/logger';
import { GetProposalsFunction } from '@/server/tools/chains/chain-indexer';
import getCosmWasmClient from '@/server/tools/get-chain-client';

import { $Enums } from '.prisma/client';

import ProposalStatus = $Enums.ProposalStatus;

const { logInfo, logError, logWarn } = logger('get-proposals');

const NEUTRON_DAO_CORE_CONTRACT = 'neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff';
const AVERAGE_BLOCK_TIME_MS = 5500; // 5.5 seconds, average block time for Neutron

interface Proposal {
  type: string;
  proposalId: string;
  status: ProposalStatus;
  submitTime: string;
  depositEndTime: string;
  votingStartTime: string;
  votingEndTime: string;
  tallyResult: string;
  finalTallyResult: string;
  title: string;
  description: string;
  content: string;
}

interface ProposalsResult {
  proposals: Proposal[];
  total: number;
  live: number;
  passed: number;
}

interface ChainProposal {
  title: string;
  description: string;
  proposer: string;
  start_height: number;
  expiration: { at_time: string };
  total_power: string;
  msgs: [];
  status: 'open' | 'passed' | 'rejected' | 'executed';
  votes: { yes: string; no: string; abstain: string };
  allow_revoting: boolean;
}

interface Vote {
  voter: string;
  vote: string;
  power: string;
}

interface NormalizedTally {
  yes_count: number;
  no_count: number;
  abstain_count: number;
  no_with_veto_count: number;
}

function normalizeTally(votes: Vote[]): NormalizedTally {
  const result: NormalizedTally = {
    yes_count: 0,
    no_count: 0,
    abstain_count: 0,
    no_with_veto_count: 0,
  };

  try {
    for (const vote of votes) {
      const power = Number(vote.power) || 0;
      switch (vote.vote.toLowerCase()) {
        case 'yes':
          result.yes_count += power;
          break;
        case 'no':
          result.no_count += power;
          break;
        case 'abstain':
          result.abstain_count += power;
          break;
        case 'no_with_veto':
          result.no_with_veto_count += power;
          break;
        default:
          logWarn(`Unknown vote type: ${vote.vote}`);
      }
    }
  } catch (error) {
    logError('Error parsing tally data:', error);
  }

  return result;
}

const blockCache: { [height: string]: string } = {};
const moduleConfigCache: { [address: string]: any } = {};

async function getModuleConfig(client: CosmWasmClient, moduleAddress: string): Promise<any> {
  if (moduleConfigCache[moduleAddress]) {
    return moduleConfigCache[moduleAddress];
  }

  try {
    const config = await client.queryContractSmart(moduleAddress, { config: {} });
    moduleConfigCache[moduleAddress] = config;
    return config;
  } catch (error) {
    logError(`Error fetching config for module ${moduleAddress}:`, error);
    return { max_voting_period: { time: 604800 } }; // Fallback: 7 days in seconds
  }
}

async function getBlockTimestamp(client: CosmWasmClient, height: number): Promise<string> {
  if (blockCache[height]) {
    return blockCache[height];
  }

  try {
    const block = await client.getBlock(height);
    const timestamp = new Date(+block.header.time).toISOString();
    blockCache[height] = timestamp;
    return timestamp;
  } catch (error: any) {
    logWarn(`Block ${height} not available, estimating timestamp: ${error.message}`);
    try {
      const currentBlock = await client.getBlock();
      const currentHeight = currentBlock.header.height;
      const currentTime = new Date(+currentBlock.header.time).getTime();

      const blockDiff = currentHeight - height;
      const timeDiffMs = blockDiff * AVERAGE_BLOCK_TIME_MS;
      const estimatedTime = new Date(currentTime - timeDiffMs).toISOString();

      blockCache[height] = estimatedTime;
      return estimatedTime;
    } catch (estimateError) {
      logError(`Error estimating timestamp for block ${height}:`, estimateError);
      return new Date().toISOString();
    }
  }
}

const getProposals: GetProposalsFunction = async (chain) => {
  const client = await getCosmWasmClient(chain.name);

  const result: ProposalsResult = {
    proposals: [],
    total: 0,
    live: 0,
    passed: 0,
  };

  if (!client) {
    logError(`No client available for chain ${chain.name}`);
    return result;
  }

  try {
    const daoResponse = await client.queryContractSmart(NEUTRON_DAO_CORE_CONTRACT, {
      proposal_modules: {},
    });

    const proposalModules: { address: string; prefix: string }[] = daoResponse || [];

    for (const mod of proposalModules) {
      if (mod.prefix === 'C') {
        continue;
      }
      try {
        let startAfter: number | null = null;
        let proposalType = 'unknown';

        switch (mod.prefix) {
          case 'A':
            proposalType = 'single-choice';
            break;
          case 'B':
            proposalType = 'multiple-choice';
            break;
          case 'C':
            proposalType = 'overrule';
            break;
          default:
            logWarn(`Unknown prefix ${mod.prefix} for mod ${mod.address}`);
        }

        const config = await getModuleConfig(client, mod.address);

        let maxVotingPeriodMs = 604800000;
        if (config.max_voting_period?.time) {
          maxVotingPeriodMs = Number(config.max_voting_period.time) * 1000;
        }

        while (true) {
          const queryMsg = {
            list_proposals: {
              start_after: startAfter,
              limit: 100,
            },
          };

          const proposalsResponse = await client.queryContractSmart(mod.address, queryMsg);

          if (!proposalsResponse.proposals || proposalsResponse.proposals.length === 0) {
            break;
          }

          for (const proposalObj of proposalsResponse.proposals) {
            const proposal: ChainProposal = proposalObj.proposal as ChainProposal;
            const proposalId = proposalObj.id.toString();
            let status: any = proposal.status;

            if (status === 'open') {
              status = ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD;
              result.live += 1;
            } else if (status === 'passed') {
              status = ProposalStatus.PROPOSAL_STATUS_PASSED;
              result.passed += 1;
            } else if (status === 'rejected') {
              status = ProposalStatus.PROPOSAL_STATUS_REJECTED;
            } else if (status === 'executed') {
              status = ProposalStatus.PROPOSAL_STATUS_PASSED;
            } else {
              status = ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;
            }

            let submitTime = new Date().toISOString();
            let votingEndTime = '';
            if (proposal.expiration?.at_time) {
              const votingEndTimeMs = Number(proposal.expiration.at_time) / 1_000_000;
              votingEndTime = new Date(votingEndTimeMs).toISOString();
              submitTime = new Date(votingEndTimeMs - maxVotingPeriodMs).toISOString();
            } else if (proposal.start_height) {
              submitTime = await getBlockTimestamp(client, proposal.start_height);
            }

            let tallyResult = '';
            let finalTallyResult = '';
            if (status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
              try {
                const tallyResponse = await client.queryContractSmart(mod.address, {
                  list_votes: { proposal_id: proposalObj.id },
                });
                const normalizedTally = normalizeTally(tallyResponse.votes || []);
                tallyResult = JSON.stringify(normalizedTally);
              } catch (tallyError) {
                logError(`Error fetching tally for proposal ${proposalId} in mod ${mod.address}:`, tallyError);
              }
            } else {
              finalTallyResult = JSON.stringify({
                yes_count: proposal.votes.yes || '0',
                no_count: proposal.votes.no || '0',
                abstain_count: proposal.votes.abstain || '0',
                no_with_veto_count: '0',
              });
            }

            const proposalData: Proposal = {
              type: proposalType,
              proposalId,
              status,
              submitTime,
              depositEndTime: submitTime,
              votingStartTime: submitTime,
              votingEndTime,
              tallyResult,
              finalTallyResult,
              title: proposal.title || 'Untitled Proposal',
              description: proposal.description || 'No description provided',
              content: 'No content provided',
            };

            logInfo(
              `Proposal ${proposalId} ${proposal.title} submitTime: ${submitTime}, votingEndTime: ${votingEndTime}`,
            );

            result.proposals.push(proposalData);
          }

          startAfter = proposalsResponse.proposals[proposalsResponse.proposals.length - 1]?.id || null;
          if (!startAfter) {
            break;
          }
        }
      } catch (moduleError) {
        logError(`Error processing mod ${mod.address}:`, moduleError);
      }
    }

    result.total = result.proposals.length;
    logInfo(`Fetched ${result.total} proposals for Neutron`);
  } catch (error) {
    logError('Error fetching proposals:', error);
  }

  return result;
};

export default getProposals;
