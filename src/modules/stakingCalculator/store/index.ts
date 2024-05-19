import { extractStore } from 'utils/extractStore'
import { defineStore } from 'pinia'
import { useState } from './state'

export const useCalculatorStore = defineStore('calculator', () => {
  return {
    ...extractStore(useState()),
  }
})
