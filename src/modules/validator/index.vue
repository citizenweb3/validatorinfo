<template>
  <h1>Validator ID: {{ validatorId }}</h1>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
// Table
import ValidatorsTable from './components/ValidatorsTable.vue'
const route = useRoute()

export default defineComponent({
  name: 'ValidatorsDashboard',
  components: {
    ValidatorsTable,
  },
  setup() {
    return {
      validatorId: route.params.id,
    }
  },
})
</script>
