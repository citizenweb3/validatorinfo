<template>
  <div class="relative flex-grow w-full mb-0.5 bg-transparent">
    <div class="z-10 absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
      <font-awesome-icon class="text-americanYellow" :icon="['fas', 'search']" size="sm" />
    </div>
    <div>
      <el-input
        v-model="textInput"
        type="text"
        placeholder="Search"
        input-style="color: red; font-weight: 400;"
        clearable
      />
      <div
        class="flex z-10 absolute inset-y-0 right-0 pr-4 items-center lg:hidden md:hidden sm:hidden"
        :class="{ hidden: isSBPin }"
      >
        <el-icon
          :size="20"
          class="w-4 h-4 text-black hover:text-slate-300"
          @click="$emit('close-search')"
        >
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
  <hr class="solidline" />
  <div class="flex justify-center">
    <button class="button mr-10 px-2 py-2" @click="handleKnokKnokButtonClick">
      <img src="@/assets/images/ai%20button.png" alt="Ai button" />
    </button>
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
    const isSBPin = computed(() => store.dashboard.isSBPin)

    return {
      isSBPin,
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
    @apply relative transition-all duration-200 pt-2 pl-10.25 placeholder:text-h6   sm:w-[291px] resize-y leading-6 font-normal shadow-none border-none bg-transparent #{!important};
    caret-color: theme('colors.americanYellow') #{!important};
    &:focus {
      @apply w-full bg-transparent text-black  #{!important};
    }

    //noinspection CssUnknownTarget
    cursor: url('@/assets/images/cursor.svg') 0 0, auto #{!important};
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
  background-image: url( '@/assets/icons/random_validator_button.svg' );
}
</style>
