<template>
  <div class="w-full mx-auto">
<!--    <Tabs />-->
    <ValidatorsTable />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// Table
import ValidatorsTable from './components/ValidatorsTable.vue'
import Tabs from '../../tabs/view/index.vue'

export default defineComponent({
  name: 'ValidatorsDashboard',
  components: {
    ValidatorsTable, Tabs
  },
  setup() {
    return {}
  },
})
</script>
