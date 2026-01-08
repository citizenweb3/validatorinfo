import { Abi } from 'viem';

import logger from '@/logger';
import { GetProposalsFunction, ProposalsResult, ResultProposalItem } from '@/server/tools/chains/chain-indexer';
import {
  contracts,
  getL1,
  governanceAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { createViemClientWithFailover } from '@/server/utils/viem-client-with-failover';

import { $Enums } from '.prisma/client';

import ProposalStatus = $Enums.ProposalStatus;

const { logInfo, logError } = logger('get-proposals-aztec');

interface ProposalConfiguration {
  votingDelay: bigint;
  votingDuration: bigint;
  executionDelay: bigint;
  gracePeriod: bigint;
  quorum: bigint;
  requiredYeaMargin: bigint;
  minimumVotes: bigint;
}

interface Ballot {
  yea: bigint;
  nay: bigint;
}

interface ProposalData {
  config: ProposalConfiguration;
  cachedState: number; // ProposalState enum
  payload: string;
  proposer: string;
  creation: bigint;
  summedBallot: Ballot;
}

const mapAztecStateToProposalStatus = (state: number): ProposalStatus => {
  switch (state) {
    case 0: // Pending
      return ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;
    case 1: // Active
      return ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD;
    case 2: // Queued
    case 3: // Executable
      return ProposalStatus.PROPOSAL_STATUS_PASSED;
    case 4: // Executed
      return ProposalStatus.PROPOSAL_STATUS_PASSED;
    case 5: // Rejected
      return ProposalStatus.PROPOSAL_STATUS_REJECTED;
    case 6: // Dropped
      return ProposalStatus.PROPOSAL_STATUS_FAILED;
    default:
      return ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED;
  }
};

const getProposals: GetProposalsFunction = async (chain) => {
  const result: ProposalsResult = {
    proposals: [] as ResultProposalItem[],
    total: 0,
    live: 0,
    passed: 0,
  };

  try {
    const chainName = chain.name as 'aztec' | 'aztec-testnet';

    const l1ChainName = getL1[chainName];
    if (!l1ChainName) {
      logError(`${chainName}: No L1 chain configured`);
      return result;
    }

    const l1Chain = getChainParams(l1ChainName);
    const l1RpcUrls = l1Chain.nodes.filter((n: any) => n.type === 'rpc').map((n: any) => n.url);

    if (!l1RpcUrls || l1RpcUrls.length === 0) {
      logError(`${chainName}: No L1 RPC URLs found for ${l1ChainName}`);
      return result;
    }

    const contractAddress = contracts[chainName].governanceAddress;
    const abi = governanceAbis[chainName] as Abi;

    const client = createViemClientWithFailover(l1RpcUrls, {
      loggerName: `${chainName}-get-proposals`,
    });

    const proposalCount = (await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: abi,
      functionName: 'proposalCount',
    })) as bigint;

    logInfo(`${chainName}: Total proposals count: ${proposalCount.toString()}`);

    if (proposalCount === BigInt(0)) {
      return result;
    }

    const allProposals: ResultProposalItem[] = [];

    for (let i = BigInt(0); i < proposalCount; i++) {
      try {
        const proposalData = (await client.readContract({
          address: contractAddress as `0x${string}`,
          abi: abi,
          functionName: 'getProposal',
          args: [i],
        })) as ProposalData;

        const status = mapAztecStateToProposalStatus(proposalData.cachedState);

        if (status === ProposalStatus.PROPOSAL_STATUS_PASSED) {
          result.passed += 1;
        }
        if (status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD) {
          result.live += 1;
        }

        const creationTime = new Date(Number(proposalData.creation) * 1000);
        const votingStartTime = new Date(
          (Number(proposalData.creation) + Number(proposalData.config.votingDelay)) * 1000,
        );
        const votingEndTime = new Date(
          (Number(proposalData.creation) +
            Number(proposalData.config.votingDelay) +
            Number(proposalData.config.votingDuration)) *
            1000,
        );

        const tallyResult = JSON.stringify({
          yea: proposalData.summedBallot.yea.toString(),
          nay: proposalData.summedBallot.nay.toString(),
        });

        allProposals.push({
          type: 'Aztec Governance Proposal',
          proposalId: i.toString(),
          status,
          submitTime: creationTime.toISOString(),
          depositEndTime: votingStartTime.toISOString(),
          votingStartTime: votingStartTime.toISOString(),
          votingEndTime: votingEndTime.toISOString(),
          tallyResult,
          finalTallyResult: tallyResult,
          content: JSON.stringify({
            payload: proposalData.payload,
            proposer: proposalData.proposer,
            config: {
              votingDelay: proposalData.config.votingDelay.toString(),
              votingDuration: proposalData.config.votingDuration.toString(),
              executionDelay: proposalData.config.executionDelay.toString(),
              gracePeriod: proposalData.config.gracePeriod.toString(),
              quorum: proposalData.config.quorum.toString(),
              requiredYeaMargin: proposalData.config.requiredYeaMargin.toString(),
              minimumVotes: proposalData.config.minimumVotes.toString(),
            },
          }),
          title: `Proposal #${i.toString()}`,
          description: `Payload: ${proposalData.payload}`,
        });
      } catch (error: any) {
        logError(`${chainName}: Error fetching proposal ${i.toString()}: ${error.message}`);
      }
    }

    return {
      ...result,
      proposals: allProposals,
      total: allProposals.length,
    };
  } catch (e: any) {
    logError(`Error fetching proposals for ${chain.name}`, e);
  }

  return result;
};

export default getProposals;
