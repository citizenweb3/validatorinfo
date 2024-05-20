<template>
  <div class="w-full">
    <img src="@/assets/screenshots/chart_main_table.png" alt="" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ValidatorOverviewInfo } from 'modules/validators/store/types'
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/vue/outline'
import BatteryComponent from './BatteryComponent.vue'
import useStore from 'store'
import PieChart from '../../../components/Charts/PieChart/PieChart.vue'

const store = useStore()

export default defineComponent({
  name: 'ValidatorsTable',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
    BatteryComponent,
    PieChart,
  },
  props: {
    title: {
      type: String,
      default: 'Validators',
    },
  },
  setup() {
    const tableData: ValidatorOverviewInfo[] = store.validators.data

    return {
      tableData,
    }
  },
})
</script>
<style lang="scss" scoped>
.logo-wrapper {
  .validator-logo {
    height: 20px;
    width: 20px;
    padding: 5px;
    margin: 5px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50%;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    background-color: white;
  }
}
</style>
