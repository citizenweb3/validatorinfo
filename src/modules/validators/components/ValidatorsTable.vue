<template>
  <div class="w-full">
    <div class="flex flex-wrap flex-col bg-dark shadow mb-7 mx-auto">
      <div class="block overflow-x-auto w-full p-0">
        <el-table v-if="tableData" :data="tableData" style="width: 100%" class="is-light cursor-pointer">
          <el-table-column label="Validator Name" min-width="200">
            <!--  scope.row.pageName -->
            <template #default="scope">
              <div class="flex items-center">
                <router-link :to="`/validators/${scope.row.id}/networks`">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter cursor-pointer">
                    {{ scope.row.name }}
                  </span>
                </router-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Supported Assets" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <span class="flex mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                  <div v-for="(item, index) in scope.row.supportedAssets" :key="index" class="logo-wrapper">
                    <div class="validator-logo" :style="{ 'background-image': 'url(' + item.logoUrl + ')' }" />
                  </div>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Battery" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                  <battery-component :battery-level="scope.row.batteryLevel" />
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="TVS" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ scope.row.tvl }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Tech Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ scope.row.techScore }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Soc. Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ scope.row.socialScore }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Gov. Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ scope.row.govScore }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="User Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ scope.row.userScore }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Links" min-width="150">
            <template #default="scope">
              <span class="flex mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                  <div v-for="(item, index) in scope.row.links" :key="index" class="logo-wrapper">
                    <el-link :underline='false' :href='item.url' class="validator-logo" :style="{ 'background-image': 'url(' + item.logoUrl + ')' }" />
                  </div>
                </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ValidatorOverviewInfo } from 'modules/validators/store/types'
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/vue/outline'
import BatteryComponent from './BatteryComponent.vue'
import useStore from 'store'

const store = useStore()

export default defineComponent({
  name: 'ValidatorsTable',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
    BatteryComponent
  },
  props: {
    title: {
      type: String,
      default: 'Validators',
    },
  },
  setup() {
    const tableData: ValidatorOverviewInfo[] = store.validators.data

    return {
      tableData,
    }
  },
})
</script>
<style lang="scss" scoped>
.logo-wrapper {
  .validator-logo {
    height: 30px;
    width: 30px;
    padding: 5px;
    margin: 5px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50%;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
}
</style>
