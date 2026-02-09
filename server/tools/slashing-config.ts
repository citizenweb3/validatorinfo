export type AddressFieldType = 'consensusAddress' | 'consensusPubkey' | 'operatorAddress';
export type UptimeCalculationType = 'fixed-window' | 'per-validator-slots';

export interface SlashingConfig {
  addressField: AddressFieldType;
  uptimeCalculation: UptimeCalculationType;
}

const ECOSYSTEM_SLASHING_CONFIGS: Record<string, SlashingConfig> = {
  cosmos: {
    addressField: 'consensusAddress',
    uptimeCalculation: 'fixed-window',
  },
  solana: {
    addressField: 'consensusPubkey',
    uptimeCalculation: 'fixed-window',
  },
  namada: {
    addressField: 'operatorAddress',
    uptimeCalculation: 'fixed-window',
  },
  ethereum: {
    addressField: 'consensusPubkey',
    uptimeCalculation: 'fixed-window',
  },
  polkadot: {
    addressField: 'consensusPubkey',
    uptimeCalculation: 'fixed-window',
  },
};

const DEFAULT_CONFIG: SlashingConfig = {
  addressField: 'consensusAddress',
  uptimeCalculation: 'fixed-window',
};

export const getSlashingConfig = (ecosystem: string): SlashingConfig => {
  const normalizedEcosystem = ecosystem.toLowerCase();
  const config = ECOSYSTEM_SLASHING_CONFIGS[normalizedEcosystem];

  if (!config) {
    return DEFAULT_CONFIG;
  }

  return config;
};

const CHAIN_SPECIFIC_OVERRIDES: Record<string, SlashingConfig> = {
  'aztec': {
    addressField: 'operatorAddress',
    uptimeCalculation: 'per-validator-slots',
  },
  'aztec-testnet': {
    addressField: 'operatorAddress',
    uptimeCalculation: 'per-validator-slots',
  },
};

export const getSlashingConfigWithOverrides = (
  ecosystem: string,
  chainName?: string
): SlashingConfig => {
  if (chainName && CHAIN_SPECIFIC_OVERRIDES[chainName]) {
    return CHAIN_SPECIFIC_OVERRIDES[chainName];
  }
  return getSlashingConfig(ecosystem);
};
