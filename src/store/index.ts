import { useValidatorsStore } from 'modules/validators/store';
import { useDashboardStore } from 'modules/dashboard/store';
import { useAuthStore } from 'modules/auth/store';
import { defineStore } from 'pinia'
import { useNetworksStore } from 'modules/networks/store';

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
  networks: useNetworksStore(),
  dashboard: useDashboardStore(),
  auth: useAuthStore(),
  global: globalStore(),
});

export default useStore;