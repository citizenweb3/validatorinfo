<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const router = useRoute()

const networkId = router.params.id;
</script>

<template>
  <div class="tabs-routes tabs el-tabs is-top is-stretch">
    <router-link class="el-tabs__item" :to="{name: 'NetworkGovernance'}">Governance</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkStatistics'}">Statistics</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkInfo'}">Useful info</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkDevInfo'}">Dev info</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkLiveliness'}">Liveliness</router-link>
  </div>
  <router-view></router-view>
</template>

<style lang='scss'>
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
  background-color: #3e3e3e;
  display: flex;
  .el-tabs__item {
    display: flex;
    min-width: 257px;
  }
}

//router-link-active
</style>