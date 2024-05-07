<template>
  <div class="flex justify-between relative items-center">
    <router-link :to="{ name: 'ValidatorInfo' }">
      <Button img="@/assets/logos/validatorInfoLogo.png" text="Home" />
    </router-link>
    <div class="w-full mx-1">
      <div class="triangle left"></div>
      <SearchContainer />
      <div class="triangle right"></div>
    </div>
    <router-link :to="{ name: 'ValidatorInfo' }">
      <Button img="@/assets/images/imageProfile.png" text="You" />
    </router-link>
  </div>
</template>

<style scoped lang="scss">
.triangle {
  position: absolute;
  top: 44px;
  width: 0;
  height: 0;

  &.left {
    border-left: 8px solid transparent;
    border-right: 8px solid theme('colors.lust');
    border-top: 8px solid transparent;
    border-bottom: 0px solid theme('colors.lust');
    transform: rotate(134deg);
    left: 120px !important;
  }

  &.right {
    top: 50px;
    right: 120px !important;
    transform: rotate(314deg);
    border-left: 8px solid transparent;
    border-right: 8px solid theme('colors.apple');
    border-bottom: 0px solid theme('colors.apple');
    border-top: 8px solid transparent;
  }
}
</style>
<script lang="ts">
import { defineComponent } from 'vue'

import SearchContainer from 'components/SearchBar/SearchContainer.vue'
import Button from 'components/Button/index.vue'

export default defineComponent({
  name: 'SubHeader',
  components: { Button, SearchContainer },
  setup() {
    return {}
  },
})
</script>
