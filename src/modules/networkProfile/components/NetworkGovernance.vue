<template>
  <div class="w-full">
    <div class='title text-yellow border-bottom'>Network Governance</div>

    <div class="w-1/4">
      <div class='title title-secondary'>Proposal Summary</div>
      <el-table :data="networkGovernanceData" class="is-light text-white" :show-header='false'>
        <el-table-column label="" min-width="66%">
          <template #default="scope">
            <span class="flex items-center">
              {{scope.row.key}}
            </span>
        </template>
        </el-table-column>
        <el-table-column label="" min-width="33%">
          <template #default="scope">
            <div class="flex items-center">
              {{scope.row.value}}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div>
      <img src='@/assets/screenshots/chart_network_gov_proposals.png' />
    </div>

    <div>
      <div class='title title-secondary border-bottom'>Live Proposals</div>
      <div class='flex flex-row w-full justify-center'>
        <div class='flex flex-row w-full'>
          <div class='flex flex-col w-1/2 pr-10'>
            <div>
              <span class='title title-secondary border-none'>#887</span><span class='ml-3 text-value'>Gaia 15 Software Upgrade</span>
            </div>
            <div class='text-value'>
              <div>Proposer: cosmos1e3...Ew356fZa</div>
              <div>Voting Start: 16/03/2024, 14:04:35</div>
              <div>Voting End: 30/03/2024, 14:04:35</div>
              <div>Remaining Time: 3d 5h 11m 15s</div>
            </div>
          </div>
          <div class='flex flex-col'>
            <div class='w-full'>
              <span class='title title-secondary border-none float-right mr-20'>Voting</span>
            </div>
            <img width='350rem' src='@/assets/screenshots/chart_pie_network_gov_vote_1.png' />
          </div>
        </div>

        <div class='flex flex-row w-full'>
          <div class='flex flex-col w-1/2'>
            <div>
              <span class='title title-secondary border-none'>#886</span><span class='ml-3 text-value'>Gaia 15 Software Upgrade</span>
            </div>
            <div class='text-value'>
              <div>Proposer: cosmos1ab...dd18e3qya</div>
              <div>Voting Start: 14/03/2024, 22:00:15</div>
              <div>Voting End: 28/03/2024, 22:00:15</div>
              <div>Remaining Time: 1d 12h 3m 15s</div>
            </div>
          </div>

          <div class='flex flex-col'>
            <div class='w-full'>
              <span class='title title-secondary border-none float-right mr-20'>Voting</span>
            </div>
            <img width='350rem' src='@/assets/screenshots/chart_pie_network_gov_vote_2.png' />
          </div>
        </div>

      </div>
    </div>

    <div class="w-full">
      <div class='title title-secondary'>Past Proposals List</div>

      <el-table :data="pastProposalsList" class="is-light text-white">
        <el-table-column label="I.D. / Title" min-width="33%">
          <template #default="scope">
            <span class="flex items-center w-full">
              <span>
                <font-awesome-icon :icon="['fas', 'square']" v-status-color='scope.row.status' />
                <span class='title title-smallest border-none mx-3'>#{{scope.row.id}}</span>
                <span class=''>{{scope.row.title}}</span>
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Type" min-width="33%">
          <template #default="scope">
            <div class="flex items-center">
              {{scope.row.type}}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Voting Ended" min-width="33%">
          <template #default="scope">
            <div class="flex items-center">
              {{scope.row.votingEnded}}
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div>

    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import _ from 'lodash'
const activeName = ref('network')
const route = useRoute();
const networkGovernanceData = _.toPairs({
  'Total': 150,
  'Passed': 110,
  'Rejected': 12,
  'Failed': 1,
  'Frequency': '6.70'
}).map(d => ({key: d[0], value: d[1]}));

const pastProposalsList = ref([{
  status: true,
  type:'Text',
  title: 'citizen cosmos podcast sponsorship',
  id: 885,
  votingEnded: '21/02/2024, 20:18:11'
}, {
  status: true,
  type:'Community Pool Spend',
  title: 'citizen cosmos podcast sponsorship',
  id: 884,
  votingEnded: '19/02/2024, 08:35:51'
}, {
  status: true,
  type:'Software Upgrade',
  title: 'Gaia v14 Software Upgrade',
  id: 883,
  votingEnded: '18/02/2024, 11:13:47'
}, {
  status: false,
  type:'Parameter Change',
  title: 'Decrease Inflation Rate to 0%',
  id: 881,
  votingEnded: '13/02/2024, 12:01:01'
}, {
  status: true,
  type:'Client Update',
  title: 'Client v14  Upgrade',
  id: 880,
  votingEnded: '11/02/2024, 09:29:07'
}])
</script>
