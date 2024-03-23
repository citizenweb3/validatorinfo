<script lang="ts" setup>
import { ref } from 'vue'
import ValidatorNetworksTable from './components/ValidatorNetworksTable.vue'
const activeName = ref('network')
</script>

<template>
  <div class="tabs-routes tabs el-tabs is-top is-stretch">
    <router-link class="el-tabs__item" :to="{name: 'ValidatorRevenue'}">Revenue</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorMetrics'}">Metrics</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorNetworksTable'}">Network Table</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorPublic'}">Public Good</router-link>
    <router-link class="el-tabs__item" :to="{name: 'ValidatorGovernance'}">Governance</router-link>
  </div>


  <!-- El Tabs are now replaced with Router Links -->
  <el-tabs class="tabs d-none" stretch v-model="activeName">
    <el-tab-pane label="Revenue"></el-tab-pane>
    <el-tab-pane label="Metrics"></el-tab-pane>
    <el-tab-pane label="Network Table" name="network">
      <ValidatorNetworksTable></ValidatorNetworksTable>
    </el-tab-pane>
    <el-tab-pane label="Public Good"></el-tab-pane>
    <el-tab-pane label="Governance"></el-tab-pane>
  </el-tabs>

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
