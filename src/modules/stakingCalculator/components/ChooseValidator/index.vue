<template>
  <div class="flex flex-col">
    <div class="text-white title flex text-h3 items-center validWidth">
      <div class="w-3/5">Choose a Validator:</div>
      <el-dropdown @command="handleCommand" trigger="click" class="w-2/5">
        <div class="el-dropdown-link flex justify-between">
          <span class="text-americanYellow text-h4">{{ selectedValue }}</span>
          <img width="40px" height="30px" src="@/assets/images/plus.png" />
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="CitizenWeb3">CitizenWeb3</el-dropdown-item>
            <el-dropdown-item command="Mint">Mint</el-dropdown-item>
            <el-dropdown-item command="Validator 1">Validator 1</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'ChooseValidator',

  setup() {
    const selectedValue = ref('')
    const handleCommand = (command: string) => {
      selectedValue.value = command
      console.log(`click on item ${command}`)
    }
    return {
      selectedValue,
      handleCommand,
    }
  },
})
</script>

<style>
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
.validWidth {
  width: 382px;
}
</style>
