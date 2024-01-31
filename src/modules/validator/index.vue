<template>
  <h1>Validator ID: {{ validatorId }}</h1>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

export default defineComponent({
  name: 'ValidatorsDashboard',
  setup() {
    return {
      validatorId: route.params.id,
    }
  },
})
</script>
