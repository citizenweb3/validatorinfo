<template>
  <div class="flex justify-between">
    <router-link class="p-6" :to="{ name: 'ValidatorInfo' }">
      <img
        src="@/assets/logos/validatorInfoLogo.png"
        class="max-h-24 max-w-full align-middle"
        alt="main logo"
      />
    </router-link>
    <SearchContainer />
    <router-link class="p-6" :to="{ name: 'ValidatorInfo' }">
      <img
        src="@/assets/images/imageProfile.png"
        class="max-h-24 max-w-full align-middle"
        alt="profile"
      />
    </router-link>
  </div>
</template>

<style scoped lang="scss"></style>
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
