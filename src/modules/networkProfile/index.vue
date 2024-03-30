<script lang="ts" setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'components/Button/index.vue'
const route = useRoute()

const networkId = route.params.id
const router = useRouter()

const activeButtonIndex = ref(2)
const handleClick = (index: number) => {
  activeButtonIndex.value = index
}
</script>

<template>
  <div>
    <div class="title">
      <span class="text-white">Network: </span><span class="capitalize">{{ networkId }}</span>
    </div>
    <div class="flex center-items flex-row justify-space-between">
      <div class="flex flex-col text-white w-1/3 font-size">
        <div class="title title-secondary text-yellow border-none">Cosmos</div>
        <div>Build a blockchain using the best-in class open source libraries and services.</div>
      </div>
      <div class="w-1/3 text-white mx-auto text-center">
        <img src="@/assets/screenshots/cosmos_logo.png" />
      </div>
      <div class="flex flex-col center-items w-1/5 mr-9">
        <Button text="Show latest transactions" round />
      </div>
    </div>
  </div>

  <div class="flex justify-between">
    <router-link :to="{ name: 'NetworkGovernance' }" @click.prevent.native="handleClick(0)">
      <Button
        :text="'Governance'"
        :tabs="true"
        :index="0"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'NetworkStatistics' }" @click.prevent.native="handleClick(1)">
      <Button
        :text="'Statistics'"
        :tabs="true"
        :index="1"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'NetworkInfo' }" @click.prevent.native="handleClick(2)">
      <Button
        :text="'Useful info'"
        :tabs="true"
        :index="2"
        :active-button-index="activeButtonIndex"
      />
    </router-link>
    <router-link :to="{ name: 'NetworkDevInfo' }" @click.prevent.native="handleClick(3)">
      <Button :text="'Dev info'" :tabs="true" :index="3" :active-button-index="activeButtonIndex" />
    </router-link>
    <router-link :to="{ name: 'NetworkLiveliness' }" @click.prevent.native="handleClick(4)">
      <Button
        :text="'Liveliness'"
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
