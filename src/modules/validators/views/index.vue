<template>
  <div class="w-full mx-auto">
    <ValidatorsTable />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// Table
import ValidatorsTable from './components/ValidatorsTable.vue'

export default defineComponent({
  name: 'ValidatorsDashboard',
  components: {
    ValidatorsTable,
  },
  setup() {
    return {}
  },
})
</script>
