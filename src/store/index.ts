import { useValidatorsStore } from 'modules/validators/store';
import { useDashboardStore } from 'modules/dashboard/store';
import { useAuthStore } from 'modules/auth/store';
import { defineStore } from 'pinia'
import { useValidatorProfileStore } from 'modules/validatorProfile/store';
import { useNetworksStore } from 'modules/networks/store';
import { useAboutUsStore } from 'modules/aboutUs/store'
import { useCalculatorStore } from 'modules/stakingCalculator/store';

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
  networks: useNetworksStore(),
  dashboard: useDashboardStore(),
  auth: useAuthStore(),
  global: globalStore(),
  aboutUs: useAboutUsStore(),
  calculate: useCalculatorStore(),
});

export default useStore;
