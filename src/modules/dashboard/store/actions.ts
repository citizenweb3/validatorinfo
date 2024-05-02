import { defineStore } from 'pinia'
import { useState } from './state'
import { useGetters } from './getters'

export const useActions = defineStore('dashboard.actions', () => {
  const state = useState()
  const getters = useGetters()

  const showWelcomeText = () => {
    if (state.welcomeText) {
      console.log(state.welcomeText)
    }
  }

  const setWelcomeText = (value = '') => {
    state.welcomeText = value
  }

  const setIsSBPin = (value: boolean) => (state.isSidebarCollapsed = value)
  const setIsSBOpen = (value: boolean) => (state.isSidebarExpanded = value)

  const toggleMenu = () => {
    if (window.innerWidth < 1024) {
      setIsSBOpen(!state.isSidebarExpanded)
    } else {
      setIsSBPin(!state.isSidebarCollapsed)
    }
  }

  return {
    showWelcomeText,
    setWelcomeText,
    setIsSBPin,
    setIsSBOpen,
    toggleMenu,
  }
})
