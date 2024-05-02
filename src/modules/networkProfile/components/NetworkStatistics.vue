<template>
  <div class="w-full">
    <div class="w-full">
      <div class="title title-secondary border-bottom">Statistics</div>
      <div class="flex flex-row">
        <div class="flex flex-col w-1/2 pr-40">
          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Accounts</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">10 000</div>
            </div>
          </div>

          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Validators</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">314</div>
            </div>
          </div>
        </div>
        <div class="flex flex-col ml-5 w-1/2 pr-40">
          <div class="flex flex-row w-full w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Total supply</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">30M</div>
            </div>
          </div>

          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Total Amount of TX</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">54M</div>
            </div>
          </div>
        </div>
      </div>

      <Button :text="'Rich list'" :round="true" />
    </div>

    <div class="w-full flex flex-row">
      <div class="flex flex-col w-full w-1/2 pr-40 h-32rem">
        <div class="flex flex-row h-16rem">
          <div class="flex flex-col w-full justify-between">
            <div class="title title-secondary border-0">Gini Coefficient</div>
            <div>
              <div class="border-0 text-white">Number of validators</div>
              <div class="border-0 text-white">120</div>
            </div>
          </div>

          <div>
            <img class src="@/assets/screenshots/chart_network_statistics_coefficient_pie.png" />
          </div>
        </div>

        <div class="flex flex-col mt-5">
          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">APY</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">32%</div>
            </div>
          </div>

          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">APR</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">30%</div>
            </div>
          </div>

          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Community Pool Total</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">10.000</div>
            </div>
          </div>

          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Average Delegations</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">314</div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col w-full w-1/2 pr-40 h-32rem">
        <div class="flex flex-row h-16rem">
          <div class="flex flex-col w-full justify-between">
            <div class="title title-secondary border-0">Nakamoto Coefficient</div>
            <div>
              <div class="border-0 text-white">3.263.829</div>
            </div>
          </div>

          <div>
            <img class src="@/assets/screenshots/chart_network_statistics_coefficient_pie.png" />
          </div>
        </div>

        <div class="flex flex-col mt-5">
          <div class="flex flex-row w-full w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Total Staked</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">12M</div>
            </div>
          </div>

          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">% Staked</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">12 %</div>
            </div>
          </div>

          <div class="flex flex-row w-full">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest border-0">Pending Undelegations</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value">30M</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full">
    <div class="title title-smallest border-bottom">Validator Distribution</div>
    <div class="flex flex-col">
      <div class="w-full flex flex-row">
        <div class="flex flex-col w-1/4">
          <div class="flex flex-row">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest text-white border-0">Active</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value-margins text-green">150</div>
            </div>
          </div>

          <div class="flex flex-row">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest text-white border-0">Jailed</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value-margins text-red">100</div>
            </div>
          </div>

          <div class="flex flex-row">
            <div class="border-bottom border-right w-1/2">
              <div class="title title-smallest text-white border-0">Inactive</div>
            </div>
            <div class="border-bottom w-1/2">
              <div class="text-value-margins text-yellow">314</div>
            </div>
          </div>
        </div>
        <div class="flex flex-col w-1/3 pl-40">
          <div class="flex flex-row justify-between">
            <div class="flex flex-col border-bottom">
              <div class="title title-smallest text-white border-none">Nakamoto Coefficient</div>
              <div class="text-value">3.223</div>
            </div>

            <div class="flex flex-col border-bottom">
              <div class="title title-smallest text-white border-none">Meanful Coefficient</div>
              <div class="text-value">3.223</div>
            </div>
          </div>
          <div class="border-bottom w-full">
            <div class="title title-smallest text-white border-none">Coef. Chart</div>
            <img src="@/assets/screenshots/chart_network_statistics_coeff_squares.png" />
          </div>
          <div class="flex flex-row justify-between">
            <div class="flex flex-col border-bottom">
              <div class="title title-smallest text-white border-none">Distribution</div>
              <div class="text-value">1.00</div>
            </div>

            <div class="flex flex-col border-bottom">
              <div class="title title-smallest text-white border-none">Top 3 Centerization</div>
              <div class="text-value">18.74%</div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <img src="@/assets/screenshots/chart_network_statistics_validator_distribution.png" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Button from 'components/Button/index.vue'

export default defineComponent({
  name: 'NetworkStatistics',
  components: { Button },
  setup() {
    return {}
  },
})
</script>
<style lang="scss" scoped></style>
