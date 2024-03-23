<template>
  <h1>Dummy validator page. Should be deleted on merge. Validator page developed in feature/validators-profile</h1>
  <h2>ID: {{ validatorId }}</h2>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'ValidatorsDashboard',
  setup() {
    const router = useRoute()
    return {
      validatorId: router.params.id,
    }
  },
})
</script>
