<script lang="ts" setup>
import { ref, onUpdated } from 'vue'
import { RouteTabsExpose } from 'components/RouteTabs/types'
import RouteTabs from 'components/RouteTabs/index.vue'
import CentralLogo from 'components/CentralLogo/index.vue'

const routeTabsRef = ref<RouteTabsExpose>(null)

const tabs = [
  {
    routeName: 'Metrics',
    text: 'Metrics'
  },{
    routeName: 'NetworksList',
    text: 'Networks'
  },{
    routeName: 'ValidatorsList',
    text: 'Validators'
  },{
    routeName: 'NotFound',
    text: '...'
  },{
    routeName: 'NotFound',
    text: '...'
  }]
onUpdated(() => {
  routeTabsRef.value?.onUpdatedHook();
})
</script>

<template>
  <div class="flex flex-col">
    <div class="title">Helpful Information</div>
    <CentralLogo class="mx-auto" />
  </div>
  <RouteTabs :tabs='tabs' ref='routeTabsRef'></RouteTabs>

</template>

<style lang="scss">
.d-none {
  display: none;
}

.tabs-routes {
  background-color: theme('colors.blackOlive');
  display: flex;
  .el-tabs__item {
    display: flex;
    min-width: 257px;
  }
}
</style>
