<template>
  <div class="w-full dark-theme-header header flex justify-between items-center p-8">
    <div class="navigations flex space-x-10">
      <p class="text-inherit">Validators: <span class="text-main">1277</span></p>
      <p class="text-inherit">Ecosystems: <span class="text-main">200</span></p>
      <p class="text-inherit">TVL: <span class="text-main">$74.6B</span></p>

      <p class='flex navigations space-x-10 text-white'>Dominance:
        <!-- Prices -->
        <p class="ml-1 text-inherit">
          Cosmos:
          <template v-if="cosmos">
            <span v-if="cosmos.price_change_percentage_24h >= 0" class="text-apple no-wrap"
              >{{ cosmos.price_change_percentage_24h }} %</span
            >
            <span v-else class="text-lust">{{ cosmos.price_change_percentage_24h }} %</span>
          </template>
        </p>
        <p class="text-inherit">
          ETH:
          <template v-if="eth">
            <span v-if="eth.price_change_percentage_24h >= 0" class="text-apple no-wrap"
              >{{ eth.price_change_percentage_24h }} %</span
            >
            <span v-else class="text-red">{{ eth.price_change_percentage_24h }} %</span>
          </template>
        </p>
        <p class="text-inherit">
          Polkadot:
          <template v-if="polkadot">
            <span v-if="polkadot.price_change_percentage_24h >= 0" class="text-apple no-wrap">
              {{ polkadot.price_change_percentage_24h }} %
            </span>
            <span v-else class="text-red">{{ polkadot.price_change_percentage_24h }} %</span>
          </template>
        </p>
      </p>
    </div>
    <div class="controls flex justify-between items-center al">
      <Button class="mr-1" icon='@/assets/icons/brilliance.svg' />
      <Button class="mr-1" text="EN" text-white />
      <Button text="USD" text-white />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted } from 'vue'
import Button from 'components/Button/index.vue'

export default defineComponent({
  name: 'Header',
  components: {
    Button,
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
        }).catch((err: any) => console.error(err))
    }
    onMounted(() => {
      fetchCryptoPrices();
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
<style scoped lang="scss">
.controls {
  align-items: stretch !important;
  align-content: stretch !important;
}

</style>

