<template>
  <div class="w-full mx-auto">
    <el-tabs class="tabs" stretch v-model="activeName">
      <el-tab-pane label="Global-POS">
        <NotFound/>
      </el-tab-pane>
      <el-tab-pane label="Staking Cal.">
        <NotFound/>
      </el-tab-pane>
      <el-tab-pane label="Validator info" name="valInfo">
        <ValidatorsTable />
      </el-tab-pane>
      <el-tab-pane label="Val. Comparison">
        <NotFound/>
      </el-tab-pane>
      <el-tab-pane label="AI">
        <NotFound/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// Table
import ValidatorsTable from '../components/ValidatorsTable.vue'
import NotFound from 'modules/pages/views/404.vue'

const activeName = ref('valInfo')
</script>

<style lang="scss"></style>
