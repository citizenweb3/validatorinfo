import { defineStore } from 'pinia'
import { NetworkProfileState } from './types'

export const useState = defineStore({
  id: 'networkProfile.state',
  state: (): NetworkProfileState => {
    return {
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
    }
  },
})
