<template>
  <div class="w-full">
    <div class="flex flex-wrap flex-col bg-white shadow mb-7 mx-auto rounded-md">
      <!-- <div class="flex flex-wrap items-center py-2 px-6 mb-0 border-b-dark-4">
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
      </div> -->

      <div class="block overflow-x-auto w-full p-0">
        <el-table :data="tableData" style="width: 100%" class="is-light cursor-pointer">
          <el-table-column label="Network" min-width="200">
            <!--  scope.row.pageName -->
            <template #default="scope">
              <div class="flex items-center">
                <router-link :to="`/networks/${scope.row.id}`">
                  <span
                    class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter cursor-pointer"
                  >
                    {{ scope.row.name }}
                  </span>
                </router-link>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="APY" min-width="100">
            <template #default="scope">
              <div class="flex items-center">
                <span
                  class="flex mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter items-center"
                >
                  {{ +(scope.row.apy * 100).toFixed(2) }}%
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Fans" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ scope.row.fans }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Rank" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    #{{ scope.row.rank }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Voting Power" min-width="100">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ +(scope.row.votingPower * 100).toFixed(2) }}%
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Commission" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ +(scope.row.commission * 100).toFixed(2) }}%
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Self Delegation" min-width="115">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter">
                    {{ scope.row.selfDelegation.amount }} {{ scope.row.selfDelegation.denom }}
                  </span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Fee" min-width="75">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  {{ +(scope.row.fee * 100).toFixed(2) }}%
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Uptime" min-width="100">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  {{ +(scope.row.uptime * 100).toFixed(2) }}%
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Missed Blocks" min-width="100">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  {{ scope.row.missedBlocks }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Participation rate" min-width="120">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-1 flex justify-center gap-1">
                  {{ +(scope.row.participationRate * 100).toFixed(2) }}%
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
import { ValidatorNetworkInfo } from '../store/types'
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/vue/outline'
import useStore from 'store'

const store = useStore()

export default defineComponent({
  name: 'ValidatorNetworksTable',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
  },
  setup() {
    const tableData: ValidatorNetworkInfo[] = store.validatorProfile.networks

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
