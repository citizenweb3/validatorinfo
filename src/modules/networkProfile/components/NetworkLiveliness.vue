<template>
  <div class="w-full">
    <div class='title title-secondary'>Liveliness</div>
  </div>

  <div class='flex-col text-white border-bottom mr-20 pl-3 pb-5'>
    <div class='title title-smallest'>Token Price</div>
    <div class='flex flex-row justify-between'>
      <div class='border p-1 my-auto'>
        <span class='title title-secondary text-white border-none'>
          {{networkData.tokenLabel}}:
        </span>
        <span class='title title-secondary  border-none'>
          ${{networkData.tokenPriceUsd}}
        </span>
      </div>
      <div class='border p-1 my-auto'>
        <span class='title title-secondary text-white border-none'>
          ATH:
        </span>
        <span class='title title-secondary  border-none'>
          ${{networkData.athPriceUsd}}
        </span>
      </div>
      <div class='border p-1 my-auto'>
        <span class='title title-secondary text-white border-none'>
          ATL:
        </span>
        <span class='title title-secondary  border-none'>
          ${{networkData.atlPriceUsd}}
        </span>
      </div>
      <div class='flex flex-col'>
        <span class='title title-smallest text-white border-none'>
          24H
        </span>
        <span v-status-color='networkData.change24h > 0'>
          {{networkData.change24h}}%
        </span>
      </div>
      <div class='flex flex-col'>
        <span class='title title-smallest text-white border-none'>
          7d
        </span>
        <span v-status-color='networkData.change7d > 0'>
          {{networkData.change7d}}%
        </span>
      </div>
      <div class='flex flex-col'>
        <span class='title title-smallest text-white border-none'>
          30d
        </span>
        <span v-status-color='networkData.change30d > 0'>
          {{networkData.change30d}}%
        </span>
      </div>
    </div>
  </div>

  <div class='flex-col text-white border-bottom mr-20 pl-3 pb-5'>
    <div class='title title-smallest'>Price Chart</div>
    <div>
      <img src='@/assets/screenshots/chart_network_liveliness_price_chart.png' />
    </div>
  </div>

  <div class='flex-col text-white border-bottom mr-20 pl-3 pb-5'>
    <div class='title title-smallest'>Distribution</div>
    <div>
      <img src='@/assets/screenshots/chart_network_liveliness_distribution.png' />
    </div>
  </div>

  <div class='flex-col text-white border-bottom mr-20 pl-3 pb-5'>
    <div class='title title-smallest'>Capital Flow</div>
    <div>
      <img src='@/assets/screenshots/chart_network_liveliness_capital_flow.png' />
    </div>
  </div>

  <div class='flex-col text-white border-bottom mr-20 pl-3 pb-5'>
    <div class='title title-smallest'>Active accounts</div>
    <div>
      <img src='@/assets/screenshots/chart_network_liveliness_accounts.png' />
    </div>
  </div>

  <div class='w-full flex flex-row justify-center border-bottom'>
    <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
      <div class='title title-smallest border-none mx-auto'>Community Pool TVL</div>
      <div class='text-white title-secondary border-none'>$20,000,000</div>
    </div>
    <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
      <div class='title title-smallest border-none mx-auto'>Connected Peers</div>
      <div class='text-white title-secondary border-none'>150</div>
    </div>
    <div class='flex flex-col mr-10 border-bottom px-10 py-4'>
      <div class='title title-smallest border-none mx-auto'>% of Tokens Staked</div>
      <div class='text-white title-secondary border-none'>65%</div>
    </div>
  </div>

  <div class='flex-col text-white border-bottom mr-20 pl-3 pb-5'>
    <div class='flex-col w-1/7 text-white'>
      <div class='title title-smallest border-bottom'>Revenue (Transaction Fees)</div>
    </div>
    <div class='pt-10 pb-5'>
      <img src='@/assets/screenshots/chart_network_devinfo_monthly_commits.png' />
    </div>
  </div>
</template>
<script lang="ts" setup>
import useStore from 'store'
import { computed, Ref } from 'vue'
import { useRoute } from 'vue-router'
import { NetworkOverviewInfo } from 'modules/networks/store/types'
const route = useRoute();
const store = useStore()
const networkId =  computed(() => route.params.id);
const networkData: Ref<NetworkOverviewInfo> = computed(() => store.networks.data.find(d => d.id === networkId.value)!);
</script>
