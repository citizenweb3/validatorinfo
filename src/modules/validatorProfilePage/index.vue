<script lang="ts">
import { defineComponent } from 'vue'
import Tabs from 'modules/tabs/view/index.vue'

export default defineComponent({
  name: 'Validators Profile Page',
  components: {
    Tabs
  },
  setup() {
    return {}
  },
  // data() {
  //   return {
  //     tabs: [
  //       {id: 0, title: "Revenue"},
  //       {id: 1, title: "Metrics"},
  //       {id: 2, title: "Network Table"},
  //       {id: 3, title: "Public Good"},
  //       {id: 4, title: "Governance"},
  //     ]
  //   }
  // }
})
</script>

<template>
  <div class='bg-eerieBlack pl-0 py-0 px-0 md:px-0 lg:px-0' >
  <Tabs />
  </div>
</template>

<style scoped lang='scss'>

</style>
