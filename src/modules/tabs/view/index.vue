<script lang='ts'>
import { defineComponent } from 'vue'
import TabsComposition from './components/TabsList.vue';
import TabComposition from './components/Tab.vue';

export default defineComponent({
  name: 'Tabs',
  props: {
    tabs: {
      type: Object
    }
  },
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
      <TabComposition>
        
      </TabComposition>
    </TabsComposition>
  </div>
</template>

<style scoped lang='scss'>

</style>
