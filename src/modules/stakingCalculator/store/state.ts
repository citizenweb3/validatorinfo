import { defineStore } from 'pinia'

export const useState = defineStore({
  id: 'calculator.state',
  state: (): CalculatorState => {
    return {
      networks: ['Cosmos', 'BTC', 'ETH', 'Polkadot', 'Solana', 'XRP'],
    }
  },
})

export interface CalculatorState {
  networks: string[]
}
