// Testnets whose FDV is bogus and must be excluded from FDV sums / rankings.
// Single source of truth — mirrors the inline exclusion in networks-list-item.tsx.
export const FDV_EXCLUDED_CHAINS = ['ethereum-sepolia', 'warden-testnet'];

export const FDV_EXCLUDED_CHAINS_SET = new Set(FDV_EXCLUDED_CHAINS);
