<template>
  <div class="validator-metrics-panel">
    <h4 class="title title-secondary">Metrics</h4>
    <div class='flex flex-col'>
      <div class='flex flex-row justify-center'>
        <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
          <div class='title title-smallest border-none mx-auto'>Technical score</div>
          <div class='text-white title-secondary border-none'>47,424,924</div>
          <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
        </div>
        <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
          <div class='title title-smallest border-none mx-auto'>Social score</div>
          <div class='text-white title-secondary border-none'>47,424,924</div>
          <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
        </div>
        <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
          <div class='title title-smallest border-none mx-auto'>Governance score</div>
          <div class='text-white title-secondary border-none'>47,424,924</div>
          <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
        </div>
        <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
          <div class='title title-smallest border-none mx-auto'>User score</div>
          <div class='text-white title-secondary border-none'>47,424,924</div>
          <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
        </div>
      </div>
      <div class='flex flex-row justify-center'>
        <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
          <div class='title title-smallest border-none mx-auto'>T.V.S</div>
          <div class='text-white title-secondary border-none'>47,424,924</div>
          <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
        </div>
        <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
          <div class='title title-smallest border-none mx-auto'>Fans</div>
          <div class='text-white title-secondary border-none'>47,424,924</div>
          <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
        </div>
        <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
          <div class='title title-smallest border-none mx-auto'>Amount of Assets</div>
          <div class='text-white title-secondary border-none'>47,424,924</div>
          <font-awesome-icon :icon="['fas', 'plus']" v-status-color='null' />
        </div>
      </div>

      <LineChart class='mx-auto w-2/3' 
          :data='{ data: [{ data: [1,2,3,4], color: "red"}, { data: [11,12,23,34], color: "green"}] }'  
          :labels='["May 1", "May 2", "May 3", "May 4"]'
          width="400"
      />
    </div>
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
</style>
