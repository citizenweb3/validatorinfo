<script setup lang='ts'>
import { ref } from 'vue'
const activeName = ref('network')
</script>

<template>
  <el-tabs class="tabs" stretch v-model="activeName">
    <el-tab-pane label="Staking"></el-tab-pane>
    <el-tab-pane label="Partners"></el-tab-pane>
    <el-tab-pane label="General info" name="generalInfo">
    </el-tab-pane>
    <el-tab-pane label="Contacts"></el-tab-pane>
  </el-tabs>
</template>

<style scoped lang='scss'>
.tabs .el-tabs__item {
  @apply bg-blackOlive font-main text-white p-1;

  &.is-active {
    @apply bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 p-1;
  }
}
</style>
