<template>
  <div class="wrapper">
    <div class="links">
      <a href="https://www.citizenweb3.com/"><CitizenIcon /></a>
      <a href="https://github.com/citizenweb3" class="mx-2"><GithubIcon /></a>
      <a href="https://twitter.com/citizen_web3"><XIcon /></a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import XIcon from '@/components/Icons/x.vue'
import GithubIcon from '@/components/Icons/github.vue'
import CitizenIcon from '@/components/Icons/citizen.vue'

export default defineComponent({
  name: 'Footer',
  components: {
    XIcon,
    GithubIcon,
    CitizenIcon,
  },
  setup() {
    return {}
  },
})
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100px;

  display: flex;
  justify-content: flex-end;
}
.links {
  display: flex;
  flex-direction: row;
}
</style>
