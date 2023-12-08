import { defineStore, StoreGetters } from 'pinia'
import { DashboardState } from './types'

export const getters: StoreGetters<DashboardState> = {
  welcomeTextText: (state: DashboardState) =>
    state.welcomeText ? 'Welcome' : 'Goodbye',
}
import { computed } from 'vue'
import { useState } from './state'

export const useGetters = defineStore('validators.getters', () => {
  const state = useState()
  const getText = computed((): string => `foo-${state.welcomeText.toString()}`)

  return {
    getText,
  }
})
