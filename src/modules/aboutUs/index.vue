<script setup lang="ts">
import Button from 'components/Button/index.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
import { computed, ref } from 'vue'


const activeButtonIndex = computed(() => {
  return ['AboutUsStaking', 'AboutUsPartners', 'AboutUsGeneral', 'AboutUsPodcast', 'AboutUsContacts'].indexOf(<string>router.currentRoute.value.name);
})

</script>

<template>
  <div class="flex w-full justify-between">
    <router-link :to="{ name: 'AboutUsStaking' }">
      <Button :text="'Staking'" :tabs="true" :index="0" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'AboutUsPartners' }">
      <Button :text="'Partners'" :tabs="true" :index="1" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'AboutUsGeneral' }">
      <Button
        :text="'General info'"
        :tabs="true"
        :index="2"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'AboutUsPodcast' }">
      <Button :text="'Podcast'" :tabs="true" :index="3" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'AboutUsContacts' }">
      <Button :text="'Contacts'" :tabs="true" :index="4" :active-button-index="activeButtonIndex" />
    </router-link>
  </div>
  <router-view></router-view>
</template>

<style scoped lang="scss"></style>
