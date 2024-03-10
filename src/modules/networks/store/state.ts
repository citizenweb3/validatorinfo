import { defineStore } from 'pinia'
import { NetworkState } from './types'

export const useState = defineStore({
  id: 'networks.state',
  state: (): NetworkState => {
    return {
      data: [
        {
          id: 'cosmos',
          name: "Cosmos"
        },
        {
          id: 'polkadot',
          name: "Polkadot",
          
        },
        {
          id: 'ethereum',
          name: "Ethereum",
        },
      ]
    }
  },
})
