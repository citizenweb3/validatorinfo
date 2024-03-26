<script setup lang='ts'>
import { ref } from 'vue'
</script>

<template>
  <div class="tabs-routes tabs el-tabs is-top is-stretch">
    <router-link class="el-tabs__item" :to="{name: 'AboutUsStaking'}">Staking</router-link>
    <router-link class="el-tabs__item" :to="{name: 'AboutUsPartners'}">Partners</router-link>
    <router-link class="el-tabs__item" :to="{name: 'AboutUsGeneral'}">General info</router-link>
    <router-link class="el-tabs__item" :to="{name: 'AboutUsContacts'}">Contacts</router-link>
  </div>
  <router-view></router-view>
</template>

<style scoped lang='scss'>
.d-none {
  display: none;
}

//router-link-active
</style>
