import { defineStore } from 'pinia'
import { ValidatorProfileState } from './types'

export const useState = defineStore({
  id: 'validatorProfile.state',
  state: (): ValidatorProfileState => {
    return {
      networks: [
        {
          id: 'cosmos',
          name: "Cosmos",
          apy: 0.1,
          commission: 0.05,
          fans: 1250450,
          fee: 0.1,
          missedBlocks: 1000,
          uptime: 1,
          participationRate: 1,
          rank: 14,
          selfDelegation: {
            amount: 500,
            denom: 'ATOM'
          },
          votingPower: 0.3
        },
        {
          id: 'polkadot',
          name: "Polkadot",
          apy: 0.14,
          commission: 0.05,
          fans: 725050,
          fee: 0.1,
          missedBlocks: 1000,
          uptime: 1,
          participationRate: 1,
          rank: 25,
          selfDelegation: {
            amount: 3000,
            denom: 'DOT'
          },
          votingPower: 0.25

        },
        {
          id: 'ethereum',
          name: "Ethereum",
          apy: 0.11,
          commission: 0.05,
          fans: 32500000,
          fee: 0.1,
          missedBlocks: 1000,
          uptime: 1,
          participationRate: 1,
          rank: 2,
          selfDelegation: {
            amount: 32,
            denom: 'ETH'
          },
          votingPower: 0.55
        },
      ]
    }
  },
})
