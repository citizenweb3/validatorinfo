import { Abi } from 'viem';

import logger from '@/logger';
import {
  AztecChainName,
  contracts,
  getL1,
  governanceAbis,
} from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { getChainParams } from '@/server/tools/chains/params';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';

const { logInfo, logError } = logger('get-proposal-ballots');

export interface Ballot {
  yea: bigint;
  nay: bigint;
}

interface ContractBallotResult {
  yea: bigint;
  nay: bigint;
}

export const getUserBallot = async (
  chainName: AztecChainName,
  proposalId: bigint,
  userAddress: string,
): Promise<Ballot | null> => {
  try {
    const l1ChainName = getL1[chainName];
    if (!l1ChainName) {
      logError(`${chainName}: No L1 chain mapping found`);
      return null;
    }

    const l1Chain = getChainParams(l1ChainName);
    const l1RpcUrls = l1Chain.nodes?.filter((n) => n.type === 'rpc').map((n) => n.url) ?? [];

    if (l1RpcUrls.length === 0) {
      logError(`${chainName}: No L1 RPC URLs available`);
      return null;
    }

    const contractAddress = contracts[chainName].governanceAddress;
    const abi = governanceAbis[chainName] as Abi;

    logInfo(`${chainName}: Fetching ballot for proposal ${proposalId} user ${userAddress}`);

    const result = await readContractWithFailover<ContractBallotResult>(
      l1RpcUrls,
      {
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'getBallot',
        args: [proposalId, userAddress as `0x${string}`],
      },
      `${chainName}-ballot`,
    );

    const ballot: Ballot = {
      yea: result.yea,
      nay: result.nay,
    };

    logInfo(`${chainName}: User ${userAddress} ballot for proposal ${proposalId}: yea=${ballot.yea}, nay=${ballot.nay}`);
    return ballot;
  } catch (e: any) {
    logError(`${chainName}: Failed to fetch ballot: ${e.message}`);
    return null;
  }
};

export default getUserBallot;
