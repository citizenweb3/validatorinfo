import { extractStore } from 'utils/extractStore'
import { defineStore } from 'pinia'
import { useState } from './state'

export const useNetworksStore = defineStore('networks', () => {
  return {
    ...extractStore(useState())
  }
})
