<script lang="ts" setup>
import { useRoute } from 'vue-router'
import RouteTabs from 'components/RouteTabs/index.vue'
import { onUpdated, ref } from 'vue'
import { RouteTabsExpose } from 'components/RouteTabs/types'
const route = useRoute()

const networkId = route.params.id
const routeTabsRef = ref<RouteTabsExpose>(null)

const tabs = [
  {
    routeName: 'NetworkGovernance',
    text: 'Governance'
  },{
    routeName: 'NetworkStatistics',
    text: 'Statistics'
  },{
    routeName: 'NetworkInfo',
    text: 'Useful info'
  },{
    routeName: 'NetworkDevInfo',
    text: 'Dev info'
  },{
    routeName: 'NetworkLiveliness',
    text: 'Liveliness'
  }]
onUpdated(() => {
  routeTabsRef.value?.onUpdatedHook();
})
</script>

<template>
  <div>
    <div class="title">
      <span class="text-white">Network: </span><span class="capitalize">{{ networkId }}</span>
    </div>
    <div class="flex center-items flex-row justify-space-between">
      <div class="flex flex-col text-white w-1/3 font-size">
        <div class="title title-secondary text-yellow border-none">Cosmos</div>
        <div>Build a blockchain using the best-in class open source libraries and services.</div>
      </div>
      <div class="w-1/3 text-white mx-auto text-center">
        <img src="@/assets/screenshots/cosmos_logo.png" />
      </div>
      <div class="flex flex-col center-items w-1/5 mr-9">
        <Button text="Show latest transactions" round />
      </div>
    </div>
  </div>

  <RouteTabs :tabs='tabs' ref='routeTabsRef'/>
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
