<template>
  <div class="flex w-full justify-between">
      <router-link :to="{ name: 'GlobalPOS' }" @click.prevent.native="handleClick(0)">
        <Button
          :text="'Global-POS'"
          :tabs="true"
          :index="0"
          :active-button-index="activeButtonIndex"
        />
      </router-link>
      <router-link :to="{ name: 'StakingCalculator' }" @click.prevent.native="handleClick(1)">
        <Button
          :text="'Staking Cal.'"
          :tabs="true"
          :index="1"
          :active-button-index="activeButtonIndex"
        />
      </router-link>
      <router-link :to="{ name: 'ValidatorInfoTables' }" @click.prevent.native="handleClick(2)">
        <Button
          :text="'Validator info'"
          :tabs="true"
          :index="2"
          :active-button-index="activeButtonIndex"
        />
      </router-link>
      <router-link :to="{ name: 'ValidatorComparison' }" @click.prevent.native="handleClick(3)">
        <Button :text="'Val. Comparison'" :tabs="true" :index="3" :active-button-index="activeButtonIndex" />
      </router-link>
      <router-link :to="{ name: 'ValidatorAI' }" @click.prevent.native="handleClick(4)">
        <Button
          :text="'AI'"
          :tabs="true"
          :index="4"
          :active-button-index="activeButtonIndex"
        />
      </router-link>
  </div>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Button from 'components/Button/index.vue'

const activeButtonIndex = ref(2)
const handleClick = (index: number) => {
  activeButtonIndex.value = index
}
</script>

<style lang="scss">
.tabs-validator-info {
  .el-tabs__active-bar {
    display: none;
  }
  .el-tabs__item {
    position: relative;
    border-bottom: 1px solid #3E3E3E;
    border-left: 1px solid #3E3E3E;
    color: white;
    font-size: 0.95rem;
    background-color: #1e1e1e;
  }
  #tab-0, #tab-1, #tab-2, #tab-3, #tab-4 {
    &::before {
      position: absolute;
      top: 3px;
      bottom: 0;
      left: 0;
      right: 0;
    }
  }

  #tab-0.is-active, #tab-1.is-active,
  #tab-2.is-active, #tab-3.is-active,
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
    background-color: transparent!important;
  }

  /** Tabs Labels **/
  #tab-0 {
    &::before {
      content: "Global-POS";
    }
  }
  #tab-0.is-active {
    &::after {
      content: "Global-POS";
    }
  }


  #tab-1 {
    &::before {
      content: "Staking Cal.";
    }
  }
  #tab-1.is-active {
    &::after {
      content: "Staking Cal.";
    }
  }


  #tab-2 {
    &::before {
      content: "Validator info";
    }
  }
  #tab-2.is-active {
    &::after {
      content: "Validator info";
    }
  }


  #tab-3 {
    &::before {
      content: "Val. Comparison";
    }
  }
  #tab-3.is-active {
    &::after {
      content: "Val. Comparison";
    }
  }


  #tab-4 {
    &::before {
      content: "AI";
    }
  }
  #tab-4.is-active {
    &::after {
      content: "AI";
    }
  }

}


</style>
