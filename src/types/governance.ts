export interface VoteStats {
  totalVotes: number;
  votesFor: number;
  votesAgainst: number;
  uniqueVoters: number;
  votingPowerFor: bigint;
  votingPowerAgainst: bigint;
}

export interface VoteEvent {
  voter: string;
  support: boolean;
  amount: string;
  timestamp: Date;
  proposalId: string;
}

export interface ValidatorSlashingHistory {
  events: Array<{
    id: number;
    attester: string;
    amount: string;
    blockNumber: string;
    timestamp: Date;
    transactionHash: string;
  }>;
  totalCount: number;
  totalSlashed: bigint;
  pages: number;
}

export interface VoterHistory {
  votes: VoteEvent[];
  totalCount: number;
  votesFor: number;
  votesAgainst: number;
  pages: number;
}
