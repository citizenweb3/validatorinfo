<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
const activeName = ref('network')
const route = useRoute();
const validatorId =  computed(() => route.params.id);
const validatorNetworkId =  computed(() => route.params.validatorNetworkId);
</script>

<template>
  <div>
    <div class='title'>Validator Profile: <span class='capitalize'>{{validatorId}}</span></div>
    <div class='flex center-items flex-row justify-space-between mt-5'>
      <div class='flex text-white w-1/3'>
        Embracing Decentralization,
        Empowering Communities.
        The Voice of Web3 &
        Non-custodial staking service.
      </div>
      <div class='flex w-1/3 text-white'>
        Validator graph
      </div>
      <div class='flex flex-col center-items w-1/3'>
        <h2 class='block'>Merits:</h2>
        <button
          class="bg-blackOlive px-2 border border-gradient-apple-to-lust border-b border-b-3 hover w-40"
        >
          <span class="bg-transparent text-white">Claimed</span>
        </button>
      </div>
    </div>
  </div>
  <div class="tabs-routes tabs el-tabs is-top is-stretch mt-5" v-if='!validatorNetworkId'>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorRevenue'}">Revenue</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorMetrics'}">Metrics</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorNetworksTable'}">Network Table</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorPublic'}">Public Good</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorGovernance'}">Governance</router-link>
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
