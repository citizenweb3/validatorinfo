export const isAztecNetwork = (chainName: string): boolean => {
  return chainName === 'aztec' || chainName === 'aztec-testnet';
};

export const hasGovernanceFeatures = (chainName: string): boolean => {
  return ['aztec', 'aztec-testnet', 'cosmos', 'polkadot'].includes(chainName);
};

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
