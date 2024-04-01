<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'components/Button/index.vue'
import CentralLogo from 'components/CentralLogo/index.vue'

const router = useRouter()

const activeButtonIndex = computed(() => {
 return ['Metrics', 'NetworksList', 'ValidatorsList'].indexOf(<string>router.currentRoute.value.name);
})
</script>

<template>
  <div class='flex flex-col'>
    <div class='title'>Helpful Information</div>
    <CentralLogo class='mx-auto'/>
  </div>
  <div class="flex justify-between mt-10">
    <router-link :to="{ name: 'Metrics' }">
      <Button :text="'Metrics'" :tabs="true" :index="0" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'NetworksList' }">
      <Button :text="'Networks'" :tabs="true" :index="1" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'ValidatorsList' }">
      <Button
        :text="'Validators'"
        :tabs="true"
        :index="2"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'NotFound' }" @click.prevent.native="handleClick(3)">
      <Button
        :text="'...'"
        :tabs="true"
        :index="3"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'NotFound' }" @click.prevent.native="handleClick(4)">
      <Button
        :text="'...'"
        :tabs="true"
        :index="4"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
  </div>
  <router-view></router-view>
</template>

<style lang="scss">
.d-none {
  display: none;
}

.tabs-routes {
  background-color: #3e3e3e;
  display: flex;
  .el-tabs__item {
    display: flex;
    min-width: 257px;
  }
}
</style>
