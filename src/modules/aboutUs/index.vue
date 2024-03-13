<script setup lang='ts'>
import { ref } from 'vue'
</script>

<template>
  <div class="tabs-routes tabs el-tabs is-top is-stretch mb-8 justify-between">
    <router-link class="el-tabs__item" :to="{name: 'AboutUsStaking'}">Staking</router-link>
    <router-link class="el-tabs__item" :to="{name: 'AboutUsPartners'}">Partners</router-link>
    <router-link class="el-tabs__item" :to="{name: 'AboutUsGeneral'}">General info</router-link>
    <router-link class="el-tabs__item" :to="{name: 'AboutUsPodcast'}">Podcast</router-link>
    <router-link class="el-tabs__item" :to="{name: 'AboutUsContacts'}">Contacts</router-link>
  </div>
  <router-view></router-view>
</template>

<style scoped lang='scss'>
.d-none {
  display: none;
}
.tabs .el-tabs__item {
  @apply bg-blackOlive font-main text-white p-1;

  &.is-active,
  &.router-link-active {
    @apply bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 p-1;
  }
}

.tabs-routes {
  background-color: theme("colors.blackOlive");
  display: flex;
  .el-tabs__item {
    display: flex;
    min-width: 257px;
  }
}


</style>
