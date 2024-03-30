<script setup lang="ts">
import Button from 'components/Button/index.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
import { ref } from 'vue'

const activeButtonIndex = ref(2)
const handleClick = (index: number) => {
  activeButtonIndex.value = index
}
</script>

<template>
  <div class="flex justify-between">
    <router-link :to="{ name: 'AboutUsStaking' }" @click.prevent.native="handleClick(0)">
      <Button
        :text="'Staking'"
        :is-round="false"
        :is-button="false"
        :is-tabs="true"
        :index="0"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'AboutUsPartners' }" @click.prevent.native="handleClick(1)">
      <Button
        :text="'Partners'"
        :is-round="false"
        :is-button="false"
        :is-tabs="true"
        :index="1"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'AboutUsGeneral' }" @click.prevent.native="handleClick(2)">
      <Button
        :text="'General info'"
        :is-round="false"
        :is-button="false"
        :is-tabs="true"
        :index="2"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'AboutUsPodcast' }" @click.prevent.native="handleClick(3)">
      <Button
        :text="'Podcast'"
        :is-round="false"
        :is-button="false"
        :is-tabs="true"
        :index="3"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'AboutUsContacts' }" @click.prevent.native="handleClick(4)">
      <Button
        :text="'Contacts'"
        :is-round="false"
        :is-button="false"
        :is-tabs="true"
        :index="4"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
  </div>
  <router-view></router-view>
</template>

<style scoped lang="scss"></style>
