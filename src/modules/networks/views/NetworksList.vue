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
        <el-table v-if="tableData" :data="tableData" style="width: 100%" class="is-light cursor-pointer">
          <el-table-column label="Network Name" min-width="200">
            <!--  scope.row.pageName -->
            <template #default="scope">
              <div class="flex items-center">
                <router-link :to="`/networks/${scope.row.id}/info`">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter cursor-pointer">
                    {{ scope.row.name }}
                  </span>
                </router-link>
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
import { NetworkOverviewInfo } from '../store/types'
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/vue/outline'
import useStore from 'store'

const store = useStore()

export default defineComponent({
  name: 'NetworksList',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
  },
  props: {
    title: {
      type: String,
      default: 'Networks',
    },
  },
  setup() {
    const tableData: NetworkOverviewInfo[] = store.networks.data

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
