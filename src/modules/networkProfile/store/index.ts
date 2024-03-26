import { extractStore } from 'utils/extractStore'
import { defineStore } from 'pinia'
import { useState } from './state'

export const useNetworkProfileStore = defineStore('networkProfile', () => {
  return {
    ...extractStore(useState())
  }
})
