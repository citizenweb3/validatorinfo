<template>
  <div class="w-full">
      <div class='title border-none'>Governance</div>
  </div>
  <div class="w-full">
    <div class='title title-secondary'>Validator Created Proposals</div>
    <div class='text-white py-12'>TODO: chart</div>
  </div>
  <div class="w-full contentItem">
    <div class='title title-secondary'>Governance News Feed</div>

    <el-table :data="governanceNewsFeed" class="is-light text-white">
      <el-table-column label="Network" min-width="25%">
        <template #default="scope">
        <span class="flex items-center">
          <font-awesome-icon :icon="['fas', 'square']" :style="{ color: scope.row.status ? '#56dd1d' : '#DD1D1DFF' }" />
          {{scope.row.network}}
        </span>
        </template>
      </el-table-column>
      <el-table-column label="I.D / Title" min-width="50%">
        <template #default="scope">
          <div class="flex items-center">
            <span class='text-gold mr-2'>#{{scope.row.id}}</span>
            {{scope.row.title}}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Vote" min-width="25%">
        <template #default="scope">
          <div class="flex items-center" :style="{ color: scope.row.vote === 'Yes' ? '#56dd1d' : '#DD1D1DFF' }">
            {{scope.row.vote}}
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>

</template>


<script setup lang='ts'>
import { ref } from 'vue'
const governanceNewsFeed = ref([{
  status: false,
  network:'Cosmos',
  title: 'Decrease inflation rate to 0%',
  id: 868,
  vote: 'No'
}, {
  status: true,
  network:'Bostrom',
  id: 35,
  title: 'approve community spending for supporting relayers',
  vote: 'Yes'
}, {
  status: true,
  network:'Bostrom',
  id: 21,
  title: 'citizen cosmos podcast sponsoring',
  vote: 'Yes'
}])
</script>

<style scoped>
/*noinspection CssUnusedSymbol*/
.svg-inline--fa {
  margin-right: 12px;
}
</style>
