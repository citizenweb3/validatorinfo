<template>
  <div class="w-full">
    <img src="@/assets/screenshots/table.png" alt="" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ValidatorNetworkInfo } from '../store/types'
import { ArrowNarrowDownIcon, ArrowNarrowUpIcon } from '@heroicons/vue/outline'
import useStore from 'store'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'ValidatorNetworksTable',
  components: {
    ArrowNarrowDownIcon,
    ArrowNarrowUpIcon,
  },
  setup() {
    const store = useStore()
    const route = useRouter()
    const tableData: ValidatorNetworkInfo[] = store.validatorProfile.networks

    return {
      validatorId: route.currentRoute.value.params.id,
      tableData,
    }
  },
})
</script>
<style lang="scss" scoped>
.logo-wrapper {
  .validator-logo {
    height: 30px;
    width: 30px;
    padding: 5px;
    margin: 5px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50%;
    box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
    background-color: white;
  }
}
</style>
