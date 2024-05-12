<script setup lang="ts">
import RouteTabs from 'components/RouteTabs/index.vue'
import { onUpdated, ref } from 'vue'
import { RouteTabsExpose } from 'components/RouteTabs/types'
const routeTabsRef = ref<RouteTabsExpose>(null)

const tabs = [
  {
    routeName: 'AboutUsStaking',
    text: 'Staking'
  },{
    routeName: 'AboutUsPartners',
    text: 'Partners'
  },{
    routeName: 'AboutUsGeneral',
    text: 'General info'
  },{
    routeName: 'AboutUsPodcast',
    text: 'Podcast'
  }, {
    routeName: 'AboutUsContacts',
    text: 'Contacts'
  }]
onUpdated(() => {
  routeTabsRef.value?.onUpdatedHook();
})

</script>

<template>
  <RouteTabs :tabs='tabs' ref='routeTabsRef'></RouteTabs>
</template>

<style scoped lang="scss"></style>
