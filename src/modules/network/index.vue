<template>
  <h1>Network ID: {{ networkId }}</h1>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'NetworkProfile',
  setup() {
    const router = useRoute()
    return {
      networkId: router.params.id,
    }
  },
})
</script>
