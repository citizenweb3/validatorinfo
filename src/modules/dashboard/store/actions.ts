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

  const setSidebarClosed = (value: boolean) => (state.isSidebarOpened = value)
  const setSidebarOpened = (value: boolean) => (state.isSidebarOpened = value)

  const toggleMenu = () => {
    state.isSidebarOpened === true ? setSidebarClosed(false) : setSidebarOpened(true)
  }

  return {
    showWelcomeText,
    setWelcomeText,
    setSidebarClosed,
    setSidebarOpened,
    toggleMenu,
  }
})
