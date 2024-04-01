<template>
  <div class="w-full">
    <div class="flex flex-wrap flex-col bg-dark shadow mb-7 mx-auto">
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

</style>
