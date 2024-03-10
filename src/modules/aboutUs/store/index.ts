import { extractStore } from 'utils/extractStore'
import { defineStore } from 'pinia'
import { useState } from './state'

export const useAboutUsStore = defineStore('aboutUs', () => {
  return {
    ...extractStore(useState())
  }
})
