<template>
  <div>
    <div class='float-right mr-6'>
      <el-icon color='white' class='mr-3' size='1rem'>
        <InfoFilled/>
      </el-icon>
      <button
        class="bg-blackOlive px-2 border border-gradient-apple-to-lust border-b border-b-3 hover"
      >
        <span class="bg-transparent text-white">Submit New Info</span>
      </button>
    </div>
    <div class="block overflow-x-auto w-full p-0">
      <el-table :data="publicGoodMediaData" class="is-light text-white">
        <el-table-column label="" min-width="80%">
          <template #default="scope">
            <div class="flex items-center">
              {{scope.row.title}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="" min-width="20%">
          <template #default="scope">
            <div class="flex items-center">
                <span
                  class="flex mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter items-center"
                >
<!--                  TODO: thumb up down buttons -->
                   TODO: Up / Down
                </span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { ref } from 'vue'
// noinspection ES6UnusedImports
import { InfoFilled } from '@element-plus/icons-vue'

const publicGoodMediaData = ref([{
  title: '1. Citizen Web Podcast'
}])
</script>

<style scoped>

</style>
