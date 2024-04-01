<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'components/Button/index.vue'
const activeName = ref('network')
const route = useRoute()
const validatorId = computed(() => route.params.id)
const validatorNetworkId = computed(() => route.params.validatorNetworkId)
const router = useRouter()

const activeButtonIndex = ref(2)
const handleClick = (index: number) => {
  activeButtonIndex.value = index
}
</script>

<template>
  <div>
    <div class="title">
      Validator Profile: <span class="capitalize">{{ validatorId }}</span>
    </div>
    <div class="flex center-items flex-row justify-space-between mt-5">
      <div class="flex text-white w-1/3">
        Embracing Decentralization, Empowering Communities. The Voice of Web3 & Non-custodial
        staking service.
      </div>
      <div class="flex w-1/3 text-white">Validator graph</div>
      <div class="flex flex-col center-items w-1/3">
        <h2 class="block">Merits:</h2>
        <Button :text="'Claimed'" :round="true" />
      </div>
    </div>
  </div>

  <div class="flex justify-between px-5" v-if="!validatorNetworkId">
    <router-link :to="{ name: 'ValidatorRevenue' }" @click.prevent.native="handleClick(0)">
      <Button :text="'Revenue'" :tabs="true" :index="0" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'ValidatorMetrics' }" @click.prevent.native="handleClick(1)">
      <Button :text="'Metrics'" :tabs="true" :index="1" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'ValidatorNetworksTable' }" @click.prevent.native="handleClick(2)">
      <Button
        :text="'Network Table'"
        :tabs="true"
        :index="2"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'ValidatorPublic' }" @click.prevent.native="handleClick(3)">
      <Button
        :text="'Public Good'"
        :tabs="true"
        :index="3"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'ValidatorGovernance' }" @click.prevent.native="handleClick(4)">
      <Button
        :text="'Governance'"
        :tabs="true"
        :index="4"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
  </div>
  <router-view></router-view>
</template>

<style lang="scss">
.d-none {
  display: none;
}
.tabs .el-tabs__item {
  @apply bg-blackOlive font-main text-white p-1;

  &.is-active,
  &.router-link-active {
    @apply bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 p-1;
  }
}

.tabs-routes {
  background-color: #3e3e3e;
  display: flex;
  .el-tabs__item {
    display: flex;
    min-width: 257px;
  }
}

//router-link-active
</style>
