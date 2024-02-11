<script lang='ts'>
import { defineComponent } from 'vue'
import TabsComposition from './components/Tabs.vue';
import TabComposition from './components/Tab.vue';
import ValidatorsTable from 'modules/validators/views/components/ValidatorsTable.vue'

export default defineComponent({
  name: 'Tabs',
  setup() {
    return {}
  },
  components: {
    TabsComposition,
    TabComposition,
    ValidatorsTable
  },
})
</script>

<template>
  <div>
    <TabsComposition>
      <TabComposition title="Revenue">    <ValidatorsTable /></TabComposition>
      <TabComposition title="Metrics">    <ValidatorsTable /></TabComposition>
      <TabComposition title="Network Table">    <ValidatorsTable /></TabComposition>
      <TabComposition title="Public Good">    <ValidatorsTable /></TabComposition>
      <TabComposition title="Governance">    <ValidatorsTable /></TabComposition>
    </TabsComposition>
  </div>
</template>

<style scoped lang='scss'>

</style>
