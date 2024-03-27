<template>
  <div class="validator-metrics-panel">
    <h4 class="sub-title">Global Metrics</h4>
    <LineChart />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import LineChart from '../../../components/Charts/LineChart/LineChart.vue';


export default defineComponent({
  name: 'ValidatorMetrics',
  components: {
    LineChart
  },

  setup() {

    return {
 
    }
  },
})
</script>
<style lang="scss" scoped>
  .validator-metrics-panel {
    margin: 10px;
  }
  .sub-title {
    color: #F3B101!important;
    margin: 10px 0;
  }
</style>