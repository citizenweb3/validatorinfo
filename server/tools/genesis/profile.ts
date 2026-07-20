export type GenesisChainName = 'cosmoshub' | 'atomone';
export type GenesisFileFormat = 'gzip' | 'json';
export type GenesisBaselineSource = 'staking-state' | 'gentx-create-validator';

export type GenesisProfile = {
  chainName: GenesisChainName;
  chainId: 'cosmoshub-4' | 'atomone-1';
  initialHeight: bigint;
  denom: string;
  fileFormat: GenesisFileFormat;
  archiveSha256?: string;
  jsonSha256: string;
  sourceEnvName: string;
  baselineSource: GenesisBaselineSource;
  compatibleCoverageHeights: readonly bigint[];
  expectedCounts: {
    accounts: number;
    validators: number;
    delegations: number;
    gentxs: number;
    storedDelegations: number;
  };
  expectedAccountTypes: Readonly<Record<string, number>>;
};

const GENESIS_PROFILES: Readonly<Record<GenesisChainName, GenesisProfile>> = {
  cosmoshub: {
    chainName: 'cosmoshub',
    chainId: 'cosmoshub-4',
    initialHeight: BigInt('5200791'),
    denom: 'uatom',
    fileFormat: 'gzip',
    archiveSha256: '7fe946e6bb3c378da546767f4d078585c38f256c8ec17888d71aeee3b7edd5c7',
    jsonSha256: '6ad715c1ab5637e505e7248bb4366e79d5dec1a24f4fac7db33fead567041633',
    sourceEnvName: 'COSMOSHUB_GENESIS_SOURCE',
    baselineSource: 'staking-state',
    compatibleCoverageHeights: [BigInt('5200791'), BigInt('5200792')],
    expectedCounts: {
      accounts: 183_969,
      validators: 268,
      delegations: 76_776,
      gentxs: 0,
      storedDelegations: 76_776,
    },
    expectedAccountTypes: {
      '/cosmos.auth.v1beta1.BaseAccount': 183_918,
      '/cosmos.auth.v1beta1.ModuleAccount': 6,
      '/cosmos.vesting.v1beta1.ContinuousVestingAccount': 1,
      '/cosmos.vesting.v1beta1.DelayedVestingAccount': 44,
    },
  },
  atomone: {
    chainName: 'atomone',
    chainId: 'atomone-1',
    initialHeight: BigInt(1),
    denom: 'uatone',
    fileFormat: 'json',
    jsonSha256: '8ea3f710675dc472beee4e26a76f466f5648b33af5942ae8d6d2f3b5a6d961a6',
    sourceEnvName: 'ATOMONE_GENESIS_SOURCE',
    baselineSource: 'gentx-create-validator',
    compatibleCoverageHeights: [BigInt(1)],
    expectedCounts: {
      accounts: 1_128_299,
      validators: 0,
      delegations: 0,
      gentxs: 6,
      storedDelegations: 6,
    },
    expectedAccountTypes: {
      '/cosmos.auth.v1beta1.BaseAccount': 1_128_299,
    },
  },
};

export const getGenesisProfile = (chainName: string): GenesisProfile => {
  if (chainName !== 'cosmoshub' && chainName !== 'atomone') {
    throw new Error(`unsupported genesis chain: ${chainName}`);
  }

  return GENESIS_PROFILES[chainName];
};
