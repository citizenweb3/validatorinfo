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
                <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Supported Assets" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Battery" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="TVS" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Tech Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Soc. Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Gov. Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="User Score" min-width="150">
            <template #default="scope">
              <div class="flex items-center">
                <div class="px-4 flex justify-center gap-1">
                  <span class="mb-0 text-0.8125 font-semibold cursor-auto text-dark-lighter"></span>
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
    const tableData: ValidatorOverviewInfo[] = [
      {
        name: "Validator One",
        supportedAssets: [
          { name: "Ethereum", url: "https://ethereum.org", logoUrl: "https://app.osmosis.zone/tokens/generated/weth.svg" },
          { name: "Polkadot", url: "https://polkadot.network", logoUrl: "https://app.osmosis.zone/tokens/generated/dot.svg" }
        ],
        batteryLevel: 75,
        tvl: [0.7, 0.3],
        techScore: 0.9,
        socialScore: 0.8,
        govScore: 0.7,
        userScore: 0.85,
        links: [
          { name: "Official Website", url: "https://validatorone.com", logoUrl: "" },
          { name: "Documentation", url: "https://validatorone.com/docs", logoUrl: "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png" }
        ]
      },
      {
        name: "Validator Two",
        supportedAssets: [
          { name: "Cosmos", url: "https://cosmos.network", logoUrl: "https://app.osmosis.zone/tokens/generated/atom.svg" },
          { name: "Osmosis", url: "https://osmosis.zone", logoUrl: "https://app.osmosis.zone/tokens/generated/osmo.svg" }
        ],
        batteryLevel: 60,
        tvl: [0.2, 0.8],
        techScore: 0.75,
        socialScore: 0.65,
        govScore: 0.8,
        userScore: 0.7,
        links: [
          { name: "Homepage", url: "https://validatorTwo.com", logoUrl: "https://validatorTwo.com/logo.png" },
          { name: "Support", url: "https://validatorTwo.com/support", logoUrl: "https://validatorTwo.com/support/logo.png" }
        ]
      },

      // Validator 3
      {
        name: "Validator Three",
        supportedAssets: [
          { name: "Binance Smart Chain", url: "https://bscscan.com", logoUrl: "https://app.osmosis.zone/tokens/generated/bnb.svg" },
          { name: "Avalanche", url: "https://avax.network", logoUrl: "https://app.osmosis.zone/tokens/generated/avax.svg" }
        ],
        batteryLevel: 85,
        tvl: [0.5, 0.5],
        techScore: 0.88,
        socialScore: 0.77,
        govScore: 0.66,
        userScore: 0.78,
        links: [
          { name: "Blog", url: "https://validatorThree.com/blog", logoUrl: "https://validatorThree.com/blog/logo.png" },
          { name: "FAQ", url: "https://validatorThree.com/faq", logoUrl: "https://validatorThree.com/faq/logo.png" }
        ]
      },
    ]

    return {
      tableData,
    }
  },
})
</script>
