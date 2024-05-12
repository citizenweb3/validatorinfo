<script setup lang='ts'>
/**
 * onUpdatedHook should always be called to enable default route when navigating to the parent component
 *
 * ### Usage in the parent component ###
 * ```
 * <template>
 *   <RouteTabs :tabs="tabs" ref="routeTabsRef" />
 * </template>
 * ```
 * ```
 * import { onUpdated, ref } from 'vue'
 * const routeTabsRef = ref<RouteTabsExpose>(null)
 * const tabs = [ .... ]
 * onUpdated(() => {
 *   routeTabsRef.value?.onUpdatedHook();
 * })
 * ```
 */

import Button from 'components/Button/index.vue'

const { tabs } = defineProps({
  tabs: {
    type: Array<{routeName: string, text: string}>,
    default: null,
  }
})
import { ref, defineExpose } from 'vue'
import { useRouter } from 'vue-router'
const activeButtonIndex = ref(2)
const route = useRouter();
const handleClick = (index: number) => {
  activeButtonIndex.value = index
}
const onUpdatedHook = () => {
  activeButtonIndex.value = tabs.findIndex((tab) => route.currentRoute.value?.matched.find(r => r.name === tab.routeName));
}

defineExpose({
  onUpdatedHook
})
</script>

<template>
  <div class="flex w-full justify-between">
    <router-link :to="{name: tab.routeName}" v-for='(tab, index) in tabs' @click.prevent.native="handleClick(index)">
      <Button
        :text="tab.text"
        :tabs="true"
        :index="index"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
  </div>
  <router-view></router-view>
</template>

<style scoped lang='scss'>

</style>
