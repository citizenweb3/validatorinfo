export type RouteTabsExpose = {
  /**
   * Should always be called to enable default route when navigating to the parent component
   *
   * ### Usage in the parent component ###
   * ```
   * <template>
   *   <RouteTabs :tabs="tabs" ref="routeTabs" />
   * </template>
   * ```
   * ```
   * <script setup lang=ts>
   * import { onUpdated, ref } from 'vue'
   * const routeTabs = ref<RouteTabsExpose>(null)
   * const tabs = [ .... ]
   * onUpdated(() => {
   *   routeTabs.value?.onUpdatedHook();
   * })
   * </script>
   * ```
   */
  onUpdatedHook: () => {}
} | null
