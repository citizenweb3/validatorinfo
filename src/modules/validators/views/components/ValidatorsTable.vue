<template>
  <div class="w-full">
    <div class="flex flex-wrap flex-col bg-white shadow mb-7 mx-auto rounded-md">
      <div class="flex flex-wrap items-center py-2 px-6 mb-0 border-b-dark-4">
        <div class="max-w-full basis-0 grow">
          <h3 class="mb-0 cursor-auto text-primary-dark">{{ title }}</h3>
        </div>
        <div class="max-w-full basis-0 grow">
          <div class="flex flex-wrap mb-0 pl-0 justify-end gap-x-3">
            <div>
              <el-button type="primary" size="small"> See all </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="block overflow-x-auto w-full p-0">
        <el-table :data="tableData" style="width: 100%" class="is-light">
          <el-table-column label="Validator Name" min-width="200">
            <!--  scope.row.pageName -->
            <template #default="scope">
              <div class="flex items-center">
                <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                  {{ scope.row.name }}
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Supported Assets" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter validator-panel">
                  <div v-for="(item, index) in scope.row.supportedAssets" :key="index">
                    <img v-if="item.logoUrl" :src="item.logoUrl" class="img-fluid" height="35" width="35" />
                  </div>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Battery" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                  {{ scope.row.batteryLevel }}
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
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
                </div>
              </div>
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
import useStore from 'store'

const store = useStore()

export default defineComponent({
  name: 'ValidatorsTable',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
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
<style lang="css">
.validator-panel {
  display: flex;
}
</style>
