export type GenesisDelegationRow = {
  delegatorAddress: string;
  validatorAddress: string;
  denom: string;
  amount: string;
};

export type GenesisRawCounts = {
  accounts: number;
  validators: number;
  delegations: number;
  gentxs: number;
};

export type GenesisValidationSummary = {
  chainId: string;
  initialHeight: bigint;
  genesisTime: Date;
  denom: string;
  counts: GenesisRawCounts;
  accountTypes: Record<string, number>;
  delegationRows: GenesisDelegationRow[];
};

export type GenesisValidationSection = 'metadata' | 'accounts' | 'validators' | 'delegations' | 'gentxs';
