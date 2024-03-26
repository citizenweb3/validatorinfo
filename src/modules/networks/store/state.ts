import { defineStore } from 'pinia'
import { NetworkState } from './types'

export const useState = defineStore({
  id: 'networks.state',
  state: (): NetworkState => {
    return {
      data: [
        {
          id: 'cosmos',
          name: "Cosmos",
          tokenPriceUsd: 23.45,
          tokenLabel: 'ATOM / USD',
          athPriceUsd: 50.87,
          atlPriceUsd: 3.5,
          change24h: 23.87,
          change7d: -13.4,
          change30d: 44,
        },
        {
          id: 'polkadot',
          name: "Polkadot",
          tokenPriceUsd: 14,
          tokenLabel: 'DOT / USD',
          athPriceUsd: 44,
          atlPriceUsd: 2.5,
          change24h: 13.4,
          change7d: -4,
          change30d: 42,

        },
        {
          id: 'ethereum',
          name: "Ethereum",
          tokenPriceUsd: 3756,
          tokenLabel: 'ETH / USD',
          athPriceUsd: 4200,
          atlPriceUsd: 12,
          change24h: 13,
          change7d: -6.4,
          change30d: 24,
        },
      ]
    }
  },
})
