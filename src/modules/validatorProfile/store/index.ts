import { extractStore } from 'utils/extractStore'
import { defineStore } from 'pinia'
import { useState } from './state'

export const useValidatorProfileStore = defineStore('validatorProfile', () => {
  return {
    ...extractStore(useState())
  }
})
