import { defineStore } from 'pinia'
import { AboutUsState } from './types'

export const useState = defineStore({
  id: 'aboutUsStore.state',
  state: (): AboutUsState => {
    return {
      staking: {data: 'STAKING'},
      partners: { data : 'PARTNERS'},
      general: {data: 'GENERAL'},
      podcast: {data: 'PODCAST'},
      contacts: { data: 'CONTACTS'}
    }
  },
})
