<template>
  <div class="w-full mx-auto">
    <el-tabs class="tabs" stretch v-model="activeName">
    <el-tab-pane label="Global-POS"></el-tab-pane>
    <el-tab-pane label="St. Cal."></el-tab-pane>
    <el-tab-pane label="Validator info" name="valInfo">
      <ValidatorsTable />    
    </el-tab-pane>
    <el-tab-pane label="Val. Comp."></el-tab-pane>
    <el-tab-pane label="AI"></el-tab-pane>
  </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// Table
import ValidatorsTable from '../components/ValidatorsTable.vue'

const activeName = ref('valInfo')
</script>

<style lang="scss">
.tabs .el-tabs__item {
  @apply bg-blackOlive font-main text-white p-1;
  
  &.is-active {
    @apply bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 p-1;
  }
}</style>