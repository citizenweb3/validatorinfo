<script lang='ts'>
import { defineComponent } from 'vue'
import TabsComposition from './components/TabsList.vue';
import TabComposition from './components/Tab.vue';

export default defineComponent({
  name: 'Tabs',
  setup() {
    return {}
  },
  components: {
    TabsComposition,
    TabComposition,
  },
})
</script>

<template>
  <div>
    <TabsComposition>
      <TabComposition title="Revenue"></TabComposition>
      <TabComposition title="Metrics"></TabComposition>
      <TabComposition title="Network Table"></TabComposition>
      <TabComposition title="Public Good"></TabComposition>
      <TabComposition title="Governance"></TabComposition>
    </TabsComposition>
  </div>
</template>

<style scoped lang='scss'>

</style>
