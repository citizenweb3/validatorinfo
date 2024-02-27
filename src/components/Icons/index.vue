<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

const icon = defineAsyncComponent(() => import(`./../../assets/icons/${props.name}.svg`))

console.log('icon', icon)
</script>

<template>
  <component :is="icon" class="fill-current" />
</template>
