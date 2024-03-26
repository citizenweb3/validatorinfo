export interface ValidatorProfileState {
    networks: ValidatorNetworkInfo[]
  }
  
  export interface ValidatorNetworkInfo {
    id: string,
    name: string,
    apy: number, // >0 %
    fans: number, // >1
    rank: number, // >1
    votingPower: number, // 0-100 %
    commission: number, // 0-100%
    selfDelegation: {
      amount: number,
      denom: string
    },
    fee: number, // 0-100%
    uptime: number, // 0-100%
    missedBlocks: number,
    participationRate: number, // 0-100%
  }