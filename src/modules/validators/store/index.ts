import { extractStore } from 'utils/extractStore'
import { defineStore } from 'pinia'
import { useActions } from './actions'
import { useGetters } from './getters'
import { useState } from './state'

export const useValidatorsStore = defineStore('validators', () => {
  return {
    ...extractStore(useState()),
    ...extractStore(useGetters()),
    ...extractStore(useActions()),
  }
})
