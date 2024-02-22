<template>
  <div class=''>{{data.data}}</div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import useStore from 'store'
import {  GeneralInfo } from 'modules/aboutUs/store/types'
const store = useStore()

export default defineComponent({
  name: "General",
  components:{},
  props: {
    title: {
      type: String,
      default: 'General tabs',
    }
  },
  setup() {
    const data: GeneralInfo= store.aboutUs.general

    return {
      data,
    }
  },
})

</script>



<style scoped lang='scss'>

</style>
