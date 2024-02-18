import { useValidatorsStore } from 'modules/validators/store';
import { useDashboardStore } from 'modules/dashboard/store';
import { useAuthStore } from 'modules/auth/store';
import { defineStore } from 'pinia'
import { useValidatorProfileStore } from 'modules/validatorProfile/store';

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
  validatorProfile: useValidatorProfileStore(),
  dashboard: useDashboardStore(),
  auth: useAuthStore(),
  global: globalStore(),
});

export default useStore;