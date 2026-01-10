export interface AztecProposalContent {
  payload: string;
  proposer: string;
  config: {
    votingDelay: string;
    votingDuration: string;
    executionDelay: string;
    gracePeriod: string;
    quorum: string;
    requiredYeaMargin: string;
    minimumVotes: string;
  };
}

export const parseAztecProposalContent = (content: unknown): AztecProposalContent | null => {
  try {
    if (typeof content === 'string') {
      return JSON.parse(content) as AztecProposalContent;
    }
    if (typeof content === 'object' && content !== null) {
      return content as AztecProposalContent;
    }
    return null;
  } catch {
    return null;
  }
};

export const getEtherscanUrl = (address: string, chainName: string): string => {
  const isTestnet = chainName === 'aztec-testnet';
  const baseUrl = isTestnet ? 'https://sepolia.etherscan.io' : 'https://etherscan.io';
  return `${baseUrl}/address/${address}`;
};

export const formatWeiAsPercentage = (weiValue: string): string => {
  try {
    const value = BigInt(weiValue);
    const percentage = Number(value) / 1e16; // Divide by 1e18 and multiply by 100
    return `${percentage.toFixed(2)}%`;
  } catch {
    return '0.00%';
  }
};

export const formatWeiAsTokenAmount = (weiValue: string): string => {
  try {
    const value = Number(weiValue) / 1e18;
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    }
    if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    }
    if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    }
    return value.toFixed(2);
  } catch {
    return '0';
  }
};

export const formatSecondsToDuration = (seconds: string): string => {
  try {
    const totalSeconds = Number(seconds);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 && days === 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(' ') : '0m';
  } catch {
    return '0m';
  }
};
