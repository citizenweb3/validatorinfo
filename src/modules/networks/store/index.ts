import { extractStore } from 'utils/extractStore'
import { defineStore } from 'pinia'
import { useState } from './state'

export const useValidatorsStore = defineStore('validators', () => {
  return {
    ...extractStore(useState())
  }
})
