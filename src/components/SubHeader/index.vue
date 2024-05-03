<template>
  <div class="flex justify-between relative">
    <router-link :to="{ name: 'ValidatorInfo' }">
      <img
        src="@/assets/logos/validatorInfoLogo.png"
        class="max-h-24 max-w-full align-middle"
        alt="main logo"
      />
    </router-link>
    <div class="triangle left"></div>
    <SearchContainer />
    <router-link :to="{ name: 'ValidatorInfo' }">
      <img
        src="@/assets/images/imageProfile.png"
        class="max-h-24 max-w-full align-middle"
        alt="profile"
      />
    </router-link>
    <div class="triangle right"></div>
  </div>
</template>

<style scoped lang="scss">
.triangle {
  position: absolute;
  top: 34px;
  width: 0;
  height: 0;

  &.left {
    border-left: 8px solid transparent;
    border-right: 8px solid theme('colors.lust');
    border-top: 8px solid transparent;
    border-bottom: 0px solid theme('colors.lust');
    transform: rotate(134deg);
    left: 85px !important;
  }

  &.right {
    top: 40px;
    right: 85px !important;
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

export default defineComponent({
  name: 'SubHeader',
  components: { SearchContainer },
  setup() {
    return {}
  },
})
</script>
