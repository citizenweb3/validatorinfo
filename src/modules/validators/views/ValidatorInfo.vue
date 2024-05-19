<template>
  <RouteTabs :tabs="tabs" ref="routeTabsRef"></RouteTabs>
</template>

<script lang="ts" setup>
import RouteTabs from 'components/RouteTabs/index.vue'
import { onUpdated, ref } from 'vue'
import { RouteTabsExpose } from 'components/RouteTabs/types'
const routeTabsRef = ref<RouteTabsExpose>(null)

const tabs = [
  {
    routeName: 'StakingCalculator',
    text: 'Staking Cal.',
  },
  {
    routeName: 'ValidatorComparison',
    text: 'Val. Comparison',
  },
  {
    routeName: 'ValidatorInfoTables',
    text: 'Validator info',
  },
  {
    routeName: 'Rumors',
    text: 'Rumors',
  },
  {
    routeName: 'GlobalPOS',
    text: 'Global-POS',
  },
]
onUpdated(() => {
  routeTabsRef.value?.onUpdatedHook()
})
</script>

<style lang="scss">
.tabs-validator-info {
  .el-tabs__active-bar {
    display: none;
  }
  .el-tabs__item {
    position: relative;
    border-bottom: 1px solid #3e3e3e;
    border-left: 1px solid #3e3e3e;
    color: white;
    font-size: 0.95rem;
    background-color: #1e1e1e;
  }
  #tab-0,
  #tab-1,
  #tab-2,
  #tab-3,
  #tab-4 {
    &::before {
      position: absolute;
      top: 3px;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }

  #tab-0.is-active,
  #tab-1.is-active,
  #tab-2.is-active,
  #tab-3.is-active,
  #tab-4.is-active {
    &::after {
      position: absolute;
      top: 3px;
      bottom: 3px;
      left: 0;
      right: 0;
      background-color: #1e1e1e;
      width: 98%;
      margin: auto;
    }
  }

  .el-tabs__active-bar {
    background-color: transparent !important;
  }

  /** Tabs Labels **/
  #tab-0 {
    &::before {
      content: 'Global-POS';
    }
  }
  #tab-0.is-active {
    &::after {
      content: 'Global-POS';
    }
  }

  #tab-1 {
    &::before {
      content: 'Staking Cal.';
    }
  }
  #tab-1.is-active {
    &::after {
      content: 'Staking Cal.';
    }
  }

  #tab-2 {
    &::before {
      content: 'Validator info';
    }
  }
  #tab-2.is-active {
    &::after {
      content: 'Validator info';
    }
  }

  #tab-3 {
    &::before {
      content: 'Val. Comparison';
    }
  }
  #tab-3.is-active {
    &::after {
      content: 'Val. Comparison';
    }
  }

  #tab-4 {
    &::before {
      content: 'AI';
    }
  }
  #tab-4.is-active {
    &::after {
      content: 'AI';
    }
  }
}
</style>
