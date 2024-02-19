<template>
  <div class="w-full mx-auto">
    <NetworksTable />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// Table
import NetworksTable from './components/NetworksTable.vue'

export default defineComponent({
  name: 'NetworksDashboard',
  components: {
    NetworksTable,
  },
  setup() {
    return {}
  },
})
</script>
