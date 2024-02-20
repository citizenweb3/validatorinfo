<script lang="ts" setup>
import { ref } from 'vue'
import ValidatorNetworksTable from './components/ValidatorNetworksTable.vue'
const activeName = ref('network')
</script>

<template>
  <el-tabs class="tabs" stretch v-model="activeName">
    <el-tab-pane label="Revenue"></el-tab-pane>
    <el-tab-pane label="Metrics"></el-tab-pane>
    <el-tab-pane label="Network Table" name="network">
      <ValidatorNetworksTable></ValidatorNetworksTable>
    </el-tab-pane>
    <el-tab-pane label="Public Good"></el-tab-pane>
    <el-tab-pane label="Governance"></el-tab-pane>
  </el-tabs>
</template>

<style lang='scss'>
.tabs .el-tabs__item {
  @apply bg-blackOlive font-main text-white p-1;

  &.is-active {
    @apply bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 p-1;
  }
}
</style>
