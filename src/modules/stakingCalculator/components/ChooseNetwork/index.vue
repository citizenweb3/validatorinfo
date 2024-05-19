<template>
  <div class="flex flex-col">
    <div class="text-white title w-full flex text-h3 items-center">
      <div class="w-2/3">Choose a Network:</div>
      <el-dropdown @command="handleCommand" trigger="click" class="w-1/2">
        <div class="el-dropdown-link flex justify-between w-full">
          <span class="text-americanYellow text-h4">{{ selectedValue }}</span>
          <img width="40px" height="30px" src="@/assets/images/plus.png" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="w-full">
            <el-dropdown-item command="Cosmos">Cosmos</el-dropdown-item>
            <el-dropdown-item command="Polkadot">Polkadot</el-dropdown-item>
            <el-dropdown-item command="ETH">ETH</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="earnings">
      <div class="flex flex-col">
        <div class="self-end">
          <el-switch v-model="valueSwitch" size="small" active-text="TOKEN" inactive-text="USD" />
        </div>

        <p class="text-h4 text-white">Enter Staking Amount</p>
        <div>
          <el-input
            v-model="valueInput"
            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
          />
        </div>
      </div>
      <div class="py-4">
        <div class="earning__item">
          <p class="text-white text-h5">1d Earning</p>
          <p class="text-americanYellow font-bold text-h4">$1.01</p>
        </div>
        <div class="earning-item">
          <p class="text-white text-h5">7d Earning</p>
          <p class="text-americanYellow font-bold text-h4">$7.01</p>
        </div>
        <div class="earning-item">
          <p class="text-white text-h5">30d Earning</p>
          <p class="text-americanYellow font-bold text-h4">$14.01</p>
        </div>
        <div class="earning-item">
          <p class="text-white text-h5">365d Earning</p>
          <p class="text-americanYellow font-bold text-h4">$14.01</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'ChooseNetwork',

  setup() {
    const selectedValue = ref('')
    const valueSwitch = ref(true)
    const valueInput = ref('')
    const handleCommand = (command: string) => {
      selectedValue.value = command
      console.log(`click on item ${command}`)
    }

    return {
      selectedValue,
      handleCommand,
      valueSwitch,
      valueInput,
    }
  },
})
</script>

<style lang="scss" scoped>
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  width: 100%;
}

.el-dropdown__popper.el-popper {
  background-color: theme('colors.eerieBlack');
  width: 174px;
  border-radius: 0;
  border: none;
}
.el-dropdown__popper .el-dropdown-menu {
  background-color: theme('colors.eerieBlack');
  width: 174px;
  border-radius: 0;
  border: none;
}
.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  list-style: none;
  line-height: 22px;
  padding: 5px 16px;
  margin: 0;
  font-size: var(--el-font-size-base);
  color: white;
  cursor: pointer;
  outline: none;
}
.el-dropdown-menu__item:hover {
  background-color: transparent;
  color: theme('colors.americanYellow');
}
.el-switch--small .el-switch__label {
  color: white;
}
.el-switch__core {
  display: inline-flex;
  position: relative;
  align-items: center;
  min-width: 40px;
  height: 20px;
  border: 1px solid theme('colors.americanYellow');
  outline: none;
  border-radius: 10px;
  box-sizing: border-box;
  background: theme('colors.americanYellow');
  cursor: pointer;
  transition: border-color var(--el-transition-duration),
    background-color var(--el-transition-duration);
}
.el-switch.is-checked .el-switch__core .el-switch__action {
  color: theme('colors.eerieBlack');
}
.el-switch__action {
  color: theme('colors.eerieBlack');
}

.el-switch__core .el-switch__action {
  position: absolute;
  left: 1px;
  border-radius: var(--el-border-radius-circle);
  transition: all var(--el-transition-duration);
  width: 16px;
  height: 16px;
  background-color: theme('colors.eerieBlack');
  display: flex;
  justify-content: center;
  align-items: center;
  color: theme('colors.americanYellow');
}
.el-switch.is-checked .el-switch__core {
  border-color: theme('colors.americanYellow');
  background-color: theme('colors.americanYellow');
}
.el-input {
  background-color: theme('colors.eerieBlack');
}
.el-input__wrapper {
  display: inline-flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  padding: 0;
  background-color: theme('colors.eerieBlack');
  background-image: none;
  border-radius: 0;
  cursor: text;
  transition: var(--el-transition-box-shadow);
  transform: translate3d(0, 0, 0);
  box-shadow: none;
  border: none;
}
body .el-input__inner {
  height: 1.875rem;
  border-radius: 0;
  border-width: 0;
  --tw-border-opacity: 1;
  background-color: theme('colors.blackOlive');
  font-size: 0.875rem;
  line-height: 1.5;
  color: theme('colors.americanYellow');
}
.el-dropdown-menu__item:not(.is-disabled):focus {
  background-color: transparent;
  color: theme('colors.americanYellow');
}
.el-scrollbar {
  box-shadow: 0 0 6px 3px theme('colors.americanYellow');
}
.earnings {
  border-left: 1px solid theme('colors.blackOlive');
  border-bottom: 1px solid theme('colors.blackOlive');
  margin-left: 0;
  padding-left: 10px;
}
</style>
