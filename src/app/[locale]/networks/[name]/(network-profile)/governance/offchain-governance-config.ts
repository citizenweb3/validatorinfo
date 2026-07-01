// Per-chain off-chain governance content for PoW networks (no on-chain proposals/voting).
// Keyed by chain.name. Channel labels are proper nouns (handles / repos) and live here, not in
// i18n; the translatable body sentence is referenced by `bodyKey` into the OffchainGovernanceInfo
// namespace. A PoW chain absent from this map falls back to a generic body with no channels list,
// so adding e.g. Bitcoin never shows Monero's text/links by accident.
export interface OffchainChannel {
  label: string;
  href: string;
}

export interface OffchainGovernanceData {
  bodyKey: string;
  channels: OffchainChannel[];
}

export const OFFCHAIN_GOVERNANCE: Record<string, OffchainGovernanceData> = {
  monero: {
    bodyKey: 'infoBodyMonero',
    channels: [
      { label: 'Reddit /r/Monero', href: 'https://www.reddit.com/r/Monero' },
      { label: 'IRC / Matrix', href: 'https://matrix.to/#/#monero:monero.social' },
      { label: 'GitHub: monero-project/monero', href: 'https://github.com/monero-project/monero' },
    ],
  },
};
