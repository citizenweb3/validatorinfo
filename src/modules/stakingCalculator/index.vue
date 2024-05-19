<template>
  <div class="text-white text-h4 py-2">
    What is Lorem Ipsum? Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown
    printer took a galley of type and scrambled it to make a type specimen book. It has survived not
    only five centuries, but also the leap into electronic typesetting, remaining essentially
    unchanged.
  </div>
  <el-divider class="border-blackOlive my-5" />
  <div class="calculatorGroup flex gap-4 flex-row">
    <div class="w-1/3"><ChooseNetwork /></div>
    <div class="w-5/12"><ChooseValidator /></div>
  </div>
  <el-divider class="border-blackOlive my-5" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ChooseNetwork from './components/ChooseNetwork/index.vue'
import ChooseValidator from './components/ChooseValidator/index.vue'

export default defineComponent({
  name: 'StakingCalculator',
  components: {
    ChooseNetwork,
    ChooseValidator,
  },
})
</script>

<style lang="scss" scoped></style>
