<template>
  <div class="titleWrapper"><p class="title px-4">Contacts</p></div>
  <div class="contentWrapper mt-9 pb-3">
    <div class="flex ml-10">
      <a href="https://www.citizenweb3.com/" class="mr-8"
        ><icon-base icon-name="citizen" width="40" height="40"><icon-citizen /></icon-base
      ></a>
      <a href="https://github.com/citizenweb3" class="mr-8">
        <icon-base icon-name="github" width="40" height="40"><icon-github /></icon-base
      ></a>
      <a href="https://twitter.com/citizen_web3" class="mr-8"
        ><icon-base icon-name="x" width="40" height="40"><icon-x /></icon-base
      ></a>
    </div>
    <div class="flex align-bottom items-center mt-5">
      <icon-base icon-name="email" class="mr-1"><icon-email /></icon-base>
      <p class="text-white"><a href="ping@validatorinfo.com">ping@validatorinfo.com</a></p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconBase from 'components/Icons/IconBase.vue'
</script>

<style scoped lang="scss">
.contentWrapper {
  border-bottom: 1px solid theme('colors.blackOlive');
}
</style>
