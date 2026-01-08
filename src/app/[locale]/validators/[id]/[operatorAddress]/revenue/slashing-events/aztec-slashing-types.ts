export interface AztecSlashingEvent {
  id: number;
  blockNumber: string;
  transactionHash: string;
  amount: string;
  timestamp: Date;
  logIndex: number;
}

export interface AztecSlashingEventDisplay {
  blockInfo: {
    number: string;
    time: string;
  };
  slashAmount: {
    tokens: number;
    usd: number;
  };
  transactionHash: string;
  explorerUrl: string;
}

export const convertToDisplayFormat = (event: AztecSlashingEvent, tokenPrice?: number): AztecSlashingEventDisplay => {
  const tokens = Number(event.amount) / 1e18;
  const usd = tokenPrice ? tokens * tokenPrice : 0;

  return {
    blockInfo: {
      number: event.blockNumber,
      time: new Date(event.timestamp).toLocaleDateString(),
    },
    slashAmount: {
      tokens,
      usd,
    },
    transactionHash: event.transactionHash,
    explorerUrl: `https://etherscan.io/tx/${event.transactionHash}`,
  };
};
