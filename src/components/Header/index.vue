<template>
  <div class='header flex justify-between items-center'>
    <div class='navigations flex space-x-20'>
      <p>Ecosystems: XXX</p>
      <p>TVL: XXX</p>
      <p>Domicance: XXX </p>
       <p>Cosmos: XX%</p>
      <p>ETH: XX%</p>
      <p>Polkadot: XX%</p>
    </div>
    <div class='controls'>
      <el-button type="primary"><Icons name="brilliance" /></el-button>
      <el-button type="primary">Primary</el-button>
      <el-button type="primary">Primary</el-button>
    </div>
  </div>
</template>


<script lang='ts'>
import { defineComponent } from 'vue'
import Icons from '../Icons/index.vue'
export default defineComponent({
  name: 'Header',
  components: {
    Icons
  }
})
</script>



<style scoped lang='scss'>

</style>
