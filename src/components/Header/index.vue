<template>
  <div class="dark-theme-header header flex justify-between items-center p-8">
    <div class="navigations flex space-x-20">
      <p class="text-inherit">Validators: <span class="text-main">1277</span></p>
      <p class="text-inherit">Ecosystems: <span class="text-main">200</span></p>
      <p class="text-inherit">TVL: <span class="text-main">$74.6B</span></p>


      <!-- Prices -->
      <p class="text-inherit">
        Dominance: Cosmos:
        <template v-if="cosmos">
          <span v-if="cosmos.price_change_percentage_24h >= 0" class="text-apple"
            >{{ cosmos.price_change_percentage_24h }} %</span
          >
          <span v-else class="text-lust">{{ cosmos.price_change_percentage_24h }} %</span>
        </template>
      </p>
      <p class="text-inherit">
        ETH:
        <template v-if="eth">
          <span v-if="eth.price_change_percentage_24h >= 0" class="text-apple"
            >{{ eth.price_change_percentage_24h }} %</span
          >
          <span v-else class="text-red">{{ eth.price_change_percentage_24h }} %</span>
        </template>
      </p>
      <p class="text-inherit">
        Polkadot:
        <template v-if="polkadot">
          <span v-if="polkadot.price_change_percentage_24h >= 0" class="text-apple">
            {{ polkadot.price_change_percentage_24h }} %
          </span>
          <span v-else class="text-red">{{ polkadot.price_change_percentage_24h }} %</span>
        </template>
      </p>
    </div>
    <div class="controls flex justify-between">
      <button
        class="bg-blackOlive px-2 border border-gradient-apple-to-lust border-b border-b-3 hover"
      >
        <BrillianceIcon class="bg-blackOlive" />
      </button>
      <button
        class="bg-blackOlive px-2 border border-gradient-apple-to-lust ml-1 border-b border-b-3 hover"
      >
        <span class="bg-transparent" :class="{ 'active-text': isActive }" @click="toggleActive"
          >EN</span
        >
      </button>
      <button
        class="bg-blackOlive px-2 border border-gradient-apple-to-lust ml-1 border-b border-b-3 hover"
      >
        <span class="bg-transparent" :class="{ 'active-text': isActive }" @click="toggleActive"
          >USD</span
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import BrillianceIcon from '@/components/Icons/brilliance.vue'
import { defineComponent, ref, inject, onMounted } from 'vue'
export default defineComponent({
  name: 'Header',
  components: {
    BrillianceIcon,
  },
  setup() {
    const isActive = ref(false)
    const toggleActive = () => {
      isActive.value = !isActive.value
    }
    let cosmos = ref({})
    let eth = ref({})
    let polkadot = ref({})

    const axios: any = inject('axios')
    const fetchCryptoPrices = (): void => {
      axios
        .get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd')
        .then((res: any) => {
          res.data.map((item: any) => {
            if (item.id === 'cosmos') {
              cosmos.value = item
            }
            if (item.id === 'ethereum') {
              eth.value = item
            }
            if (item.id === 'polkadot') {
              polkadot.value = item
            }
          })
        })
    }
    onMounted(() => {
      fetchCryptoPrices()
    })

    return {
      isActive,
      cosmos,
      eth,
      polkadot,
      toggleActive,
      fetchCryptoPrices,
    }
  },
})
</script>
