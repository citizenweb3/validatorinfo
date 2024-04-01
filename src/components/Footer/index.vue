<template>
  <div class="wrapper">
    <div class="links">
      <a href="https://www.citizenweb3.com/"
        ><icon-base icon-name="citizen" width="40" height="40"><icon-citizen /></icon-base
      ></a>
      <a href="https://github.com/citizenweb3" class="mx-2">
        <icon-base icon-name="github" width="40" height="40"><icon-github /></icon-base
      ></a>
      <a href="https://twitter.com/citizen_web3"
        ><icon-base icon-name="x" width="40" height="40"><icon-x /></icon-base
      ></a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import XIcon from 'components/Icons/IconX.vue'
import GithubIcon from 'components/Icons/IconGithub.vue'
import CitizenIcon from 'components/Icons/IconCitizen.vue'
import IconCitizen from 'components/Icons/IconCitizen.vue'

export default defineComponent({
  name: 'Footer',
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
  margin-bottom: 2rem;
}
.links {
  display: flex;
  flex-direction: row;
}
</style>
