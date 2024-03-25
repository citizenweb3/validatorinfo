<template>
  <div class="block overflow-x-auto w-full p-0">
    <div class='title'>RPC / LCD nodes:</div>
    <el-table :data="nodesData" class="is-light text-white">
      <el-table-column label="Network" min-width="33%">
        <template #default="scope">
          <span class="flex items-center">
            <font-awesome-icon :icon="['fas', 'square']" :style="{ color: scope.row.status ? '#56dd1d' : '#DD1D1DFF' }" />
            {{scope.row.network}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Endpoint" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.endpoint}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Endpoint" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.moniker}}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <div class="block overflow-x-auto w-full p-0">
    <div class='title'>Relayer nodes:</div>
    <el-table :data="relayersData" class="is-light text-white">
      <el-table-column label="Network" min-width="33%">
        <template #default="scope">
          <span class="flex items-center">
            <font-awesome-icon :icon="['fas', 'square']" :style="{ color: scope.row.status ? '#56dd1d' : '#DD1D1DFF' }" />
            {{scope.row.network}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Channel" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.channel}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Endpoint" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.moniker}}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <div class="block overflow-x-auto w-full p-0">
    <div class='title'>Archive nodes</div>
    <el-table :data="archiveNodesData" class="is-light text-white">
      <el-table-column label="Network" min-width="33%">
        <template #default="scope">
          <span class="flex items-center">
            <font-awesome-icon :icon="['fas', 'square']" :style="{ color: scope.row.status ? '#56dd1d' : '#DD1D1DFF' }" />
            {{scope.row.network}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Endpoint" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.endpoint}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Endpoint" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.moniker}}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <div class="block overflow-x-auto w-full p-0">
    <div class='title'>Other nodes</div>
    <el-table :data="otherNodesData" class="is-light text-white">
      <el-table-column label="Network" min-width="33%">
        <template #default="scope">
          <span class="flex items-center">
            <font-awesome-icon :icon="['fas', 'square']" :style="{ color: scope.row.status ? '#56dd1d' : '#DD1D1DFF' }" />
            {{scope.row.network}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Endpoint" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.endpoint}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Endpoint" min-width="33%">
        <template #default="scope">
          <div class="flex items-center">
            {{scope.row.moniker}}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
const nodesData = ref([{
  status: true,
  network:'Cosmos Hub',
  endpoint: '125.262.178.1',
  moniker: 'Citizen Web3'
}, {
  status: true,
  network:'Akash',
  endpoint: '125.262.178.2',
  moniker: 'Citizen Web3'
}])


const relayersData = ref([{
  status: true,
  network:'Cosmos Hub <-> Osmois',
  channel: 'channel-1',
  moniker: 'Citizen Web3'
}, {
  status: false,
  network:'Akash <-> Osmosis',
  channel: 'channel-23',
  moniker: 'Citizen Web3'
}])


const archiveNodesData = ref([{
  status: true,
  network:'Cosmos Hub',
  endpoint: '125.262.178.1',
  moniker: 'Citizen Web3'
}])


const otherNodesData = ref([{
  status: true,
  network:'IPFS Node',
  endpoint: '125.262.178.1',
  moniker: 'Citizen Web3'
}])
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.svg-inline--fa {
  margin-right: 12px;
}
</style>
