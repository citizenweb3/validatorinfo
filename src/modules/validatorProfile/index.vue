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
    text: 'Revenue',
  },
  {
    routeName: 'ValidatorMetrics',
    text: 'Metrics',
  },
  {
    routeName: 'ValidatorNetworksTable',
    text: 'Network Table',
  },
  {
    routeName: 'ValidatorPublic',
    text: 'Public Good',
  },
  {
    routeName: 'ValidatorGovernance',
    text: 'Governance',
  },
]
onUpdated(() => {
  routeTabsRef.value?.onUpdatedHook()
})
</script>

<template>
  <div class="mb-4">
    <img src="@/assets/screenshots/header.png" alt="" />
  </div>
  <RouteTabs :tabs="tabs" ref="routeTabsRef"></RouteTabs>
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
