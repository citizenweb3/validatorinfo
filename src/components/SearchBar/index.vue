<template>
  <div class="relative flex-grow w-full mb-0.5 bg-transparent flex justify-center">
    <div class="w-45/100 relative">
      <div class="z-10 absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <font-awesome-icon class="text-americanYellow" :icon="['fas', 'search']" size="sm" />
      </div>

      <div>
        <el-input v-model="textInput" type="text" input-style="color: red; font-weight: 400; " />
      </div>
    </div>
  </div>
  <hr class="solidline" />
  <div class="flex justify-center">
    <button class="button mr-10 px-2 py-2 rabbit" @click="handleKnokKnokButtonClick"></button>
    <button class="button lucky" @click="handleLuckyButtonClick" />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import useStore from 'store'
import { Close } from '@element-plus/icons-vue'
export default defineComponent({
  name: 'SearchBar',
  components: {
    Close,
  },
  setup() {
    const store = useStore()
    const textInput = ref('')
    const isSidebarClosed = computed(() => store.dashboard.isSidebarClosed)
    const isSidebarOpened = computed<boolean>(() => store.dashboard.isSidebarOpened)

    return {
      isSidebarClosed,
      isSidebarOpened,
      textInput,
    }
  },
  methods: {
    handleKnokKnokButtonClick() {
      console.log('knok knok')
    },

    handleLuckyButtonClick() {
      console.log('lucky lucky')
    },
  },
})
</script>

<style lang="scss" scoped>
.el-input {
  @apply bg-transparent;

  ::v-deep(.el-input__inner) {
    @apply relative transition-all duration-200 pt-2 pl-5 placeholder:text-h6 sm:w-[291px] resize-y leading-6 font-normal shadow-none border-none bg-transparent #{!important};
    caret-color: theme('colors.americanYellow') !important;
    cursor: url('assets/icons/cursor.svg'), auto !important;
    &:focus {
      @apply w-full bg-transparent text-americanYellow #{!important};
    }
  }

  ::v-deep(.el-input__wrapper) {
    background-color: transparent;
    border: none;
    box-shadow: none;
    outline: none;
  }
}

.solidline {
  width: 100%; /* Ширина полосы */
  height: 2px; /* Высота полосы */
  background: linear-gradient(
    to right,
    theme('colors.lust'),
    theme('colors.americanYellow'),
    theme('colors.apple')
  ); /* Цвет полосы */
  border: none;
  margin-top: -10px;
}
.button {
  border-bottom: 1px solid theme('colors.americanYellow');
  height: 30px;
  width: 30px;
}

.lucky {
  background-image: url('@/assets/icons/randomValidatorButton.svg');
}
.rabbit {
  background-image: url('@/assets/icons/buttonRabbit.svg');
}
</style>
