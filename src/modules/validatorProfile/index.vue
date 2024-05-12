<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'components/Button/index.vue'
const route = useRoute()
const validatorId = computed(() => route.params.id)
const validatorNetworkId = computed(() => route.params.validatorNetworkId)
import RouteTabs from 'components/RouteTabs/index.vue'
import { onUpdated } from 'vue'
import { RouteTabsExpose } from 'components/RouteTabs/types'
const routeTabsRef = ref<RouteTabsExpose>(null)

const tabs = [
  {
    routeName: 'ValidatorRevenue',
    text: 'Revenue'
  },{
    routeName: 'ValidatorMetrics',
    text: 'Metrics'
  },{
    routeName: 'ValidatorNetworksTable',
    text: 'Network'
  },{
    routeName: 'ValidatorPublic',
    text: 'Public'
  },{
    routeName: 'ValidatorGovernance',
    text: 'Governance'
  }]
onUpdated(() => {
  routeTabsRef.value?.onUpdatedHook();
})
</script>

<template>
  <div>
    <div class="title">
      <span class='text-white'>Validator Profile:</span><span class="capitalize">{{ validatorId }}</span>
    </div>
    <div class="flex center-items flex-row justify-space-between mt-5">
      <div class="flex text-white w-1/3">
        Embracing Decentralization, Empowering Communities. The Voice of Web3 & Non-custodial
        staking service.
      </div>
      <div class="flex w-1/3 text-white">Validator graph</div>
      <div class="flex flex-col center-items w-1/3">
        <h2 class="block">Merits:</h2>
        <Button :text="'Claimed'" :round="true" />
      </div>
    </div>
  </div>

  <RouteTabs :tabs='tabs' ref='routeTabsRef'></RouteTabs>
</template>

<style lang="scss">
.d-none {
  display: none;
}
.tabs .el-tabs__item {
  @apply bg-blackOlive font-main text-white p-1;

  &.is-active,
  &.router-link-active {
    @apply bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 p-1;
  }
}

.tabs-routes {
  background-color: theme('colors.blackOlive');
  display: flex;
  .el-tabs__item {
    display: flex;
    min-width: 257px;
  }
}

//router-link-active
</style>
