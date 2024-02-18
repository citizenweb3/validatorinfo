import { defineStore } from 'pinia'
import { NetworkState } from './types'

export const useState = defineStore({
  id: 'networks.state',
  state: (): NetworkState => {
    return {
      data: [
        {
          id: 0,
          name: "Cosmos"
        },
        {
          id: 1,
          name: "Polkadot",
          
        },
        {
          id: 2,
          name: "Ethereum",
        },
      ]
    }
  },
})
