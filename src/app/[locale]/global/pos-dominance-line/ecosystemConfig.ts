interface EcosystemConfig {
  readonly POW: { readonly name: "POW"; readonly color: "#ff6347"; };
  readonly Cosmos: { readonly name: "Cosmos"; readonly color: "#32cd32"; };
  readonly Near: { readonly name: "Near"; readonly color: "#4682b4"; };
  readonly Polkadot: { readonly name: "Polkadot"; readonly color: "#ff4500"; };
  readonly Ton: { readonly name: "Ton"; readonly color: "#6a5acd"; };
  readonly Ethereum: { readonly name: "Ethereum"; readonly color: "#3b9c9c"; };
  readonly Solana: { readonly name: "Solana"; readonly color: "#f4a300"; };
  readonly Cardano: { readonly name: "Cardano"; readonly color: "#a1c4fc"; };
  readonly IOTA: { readonly name: "IOTA"; readonly color: "#f1f1f1"; };
  readonly ICP: { readonly name: "ICP"; readonly color: "#9b59b6"; };
  readonly Tezos: { readonly name: "Tezos"; readonly color: "#e91e63"; };
  readonly Gnosis: { readonly name: "Gnosis"; readonly color: "#e9c46a"; };
  readonly Avalanche: { readonly name: "Avalanche"; readonly color: "#2a9d8f"; };
}

// Centralized chains and color scheme configuration
export const ECOSYSTEMS_CONFIG = {
  POW: { name: 'POW', color: '#ff6347' },
  Cosmos: { name: 'Cosmos', color: '#32cd32' },
  Near: { name: 'Near', color: '#4682b4' },
  Polkadot: { name: 'Polkadot', color: '#ff4500' },
  Ton: { name: 'Ton', color: '#6a5acd' },
  Ethereum: { name: 'Ethereum', color: '#3b9c9c' },
  Solana: { name: 'Solana', color: '#f4a300' },
  Cardano: { name: 'Cardano', color: '#a1c4fc' },
  IOTA: { name: 'IOTA', color: '#f1f1f1' },
  ICP: { name: 'ICP', color: '#9b59b6' },
  Tezos: { name: 'Tezos', color: '#e91e63' },
  Gnosis: { name: 'Gnosis', color: '#e9c46a' },
  Avalanche: { name: 'Avalanche', color: '#2a9d8f' },
} as const;

// Extract chain names and colors
export const ALL_CHAINS = Object.keys(ECOSYSTEMS_CONFIG) as (keyof typeof ECOSYSTEMS_CONFIG)[];
