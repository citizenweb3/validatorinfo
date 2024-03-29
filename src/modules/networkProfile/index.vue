<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const router = useRoute()

const networkId = router.params.id
</script>

<template>
  <div>
    <div class='title'><span class='text-white'>Network: </span><span class='capitalize'>{{networkId}}</span></div>
    <div class='flex center-items flex-row justify-space-between'>
      <div class='flex flex-col text-white w-1/3 font-size'>
        <div class='title title-secondary text-yellow border-none'>Cosmos</div>
        <div>
          Build a blockchain using the best-in class open source libraries and services.
        </div>
      </div>
      <div class='w-1/3 text-white mx-auto text-center'>
        <img src='@/assets/screenshots/cosmos_logo.png' />
      </div>
      <div class='flex flex-col center-items w-1/5 mr-9'>
        <button
          class="bg-blackOlive px-2 border border-gradient-apple-to-lust border-b border-b-3 hover w-auto"
        >
          <span class="bg-transparent text-white">Show latest transactions</span>
        </button>
      </div>
    </div>
  </div>
  <div class="tabs-routes tabs el-tabs is-top is-stretch mt-5" >
    <router-link class="el-tabs__item" :to="{name: 'NetworkGovernance'}">Governance</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkStatistics'}">Statistics</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkInfo'}">Useful info</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkDevInfo'}">Dev info</router-link>
    <router-link class="el-tabs__item" :to="{name: 'NetworkLiveliness'}">Liveliness</router-link>
  </div>
  <router-view></router-view>
</template>

<style lang="scss">
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
