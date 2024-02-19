<template>
  <h1>Network ID: {{ networkId }}</h1>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

export default defineComponent({
  name: 'NetworkDashboard',
  setup() {
    return {
      networkId: route.params.id,
    }
  },
})
</script>
