import { useValidatorsStore } from 'modules/validators/store';
import { useAuthStore } from 'modules/auth/store';
import { defineStore } from 'pinia'

export const globalStore = defineStore('global', {
  state: () => ({
    loading: false,
  }),
  actions: {
    async actLoading(status: boolean) {
      this.loading = status
    },
  },
})

const useStore = () => ({
  validators: useValidatorsStore(),
  auth: useAuthStore(),
  global: globalStore(),
});

export default useStore;