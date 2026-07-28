export const CHAINS_WITH_SLOTS = ['ethereum', 'ethereum-sepolia', 'aztec', 'aztec-testnet'] as const;

export const CHAINS_WITH_SLOTS_SET: ReadonlySet<string> = new Set(CHAINS_WITH_SLOTS);
