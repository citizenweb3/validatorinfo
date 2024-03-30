<template>
  <el-popover
    placement="bottom-end"
    trigger="click"
    popper-class="menu-popper"
    :show-arrow="false"
    @show="clickIconMenu = !clickIconMenu"
    @hide="clickIconMenu = !clickIconMenu"
  >
    <template #reference>
      <Button :text="text" round />
    </template>
    <div class="w-full m-0">
      <div class="flex flex-wrap w-full m-0">
        <a href="#!" class="flex flex-col w-2/6 py-3 text-center items-center content-center">
          <div class="flex h-13 w-14 content-center items-center text-center">
            <div class="mx-auto">
              <font-awesome-icon
                class="transition-all p-3.4 hover:px-4.5 hover:py-4.4 duration-150 text-center inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-[#f5365c] to-[#f56036]"
                :icon="['fas', 'calendar-days']"
                size="lg"
              />
            </div>
          </div>
          <span class="text-0.8125 text-white font-semibold mt-2.5">Calendar</span>
        </a>

        <a href="#!" class="flex flex-col w-2/6 py-3 text-center items-center content-center">
          <div class="flex h-13 w-14 content-center items-center text-center">
            <div class="mx-auto">
              <font-awesome-icon
                class="transition-all p-3.4 hover:p-4.4 duration-150 text-center inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-[#fb6340] to-[#fbb140]"
                :icon="['fas', 'envelope']"
                size="lg"
              />
            </div>
          </div>
          <span class="text-0.8125 text-white font-semibold mt-2.5">Email</span>
        </a>

        <a href="#!" class="flex flex-col w-2/6 py-3 text-center items-center content-center">
          <div class="flex h-13 w-14 content-center items-center text-center">
            <div class="mx-auto">
              <font-awesome-icon
                class="transition-all duration-150 px-4 py-3.4 hover:p-4.4 text-center inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-[#11cdef] to-[#1171ef]"
                :icon="['fas', 'credit-card']"
                size="lg"
              />
            </div>
          </div>
          <span class="text-0.8125 text-white font-semibold mt-2.5">Payments</span>
        </a>

        <a href="#!" class="flex flex-col w-2/6 py-3 text-center items-center content-center">
          <div class="flex text-center items-center content-center h-13 w-13">
            <div
              class="transition-all duration-150 hover:h-13 hover:w-13 h-12 w-12 mx-auto text-center inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-[#2dce89] to-[#2dcecc]"
            >
              <el-icon :size="22" class="cursor-pointer w-8 h-6">
                <List />
              </el-icon>
            </div>
          </div>
          <span class="text-0.8125 text-white font-semibold mt-2.5">Reports</span>
        </a>

        <a href="#!" class="flex flex-col w-2/6 py-3 text-center items-center content-center">
          <div class="flex text-center items-center content-center h-13 w-13">
            <div
              class="transition-all duration-150 hover:h-13 hover:w-13 h-12 w-12 mx-auto text-center inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-[#8965e0] to-[#bc65e0]"
            >
              <el-icon :size="22" class="cursor-pointer w-8 h-6">
                <LocationFilled />
              </el-icon>
            </div>
          </div>
          <span class="text-0.8125 text-white font-semibold mt-3">Maps</span>
        </a>

        <a href="#!" class="flex flex-col w-2/6 py-3 text-center items-center content-center">
          <div class="flex text-center items-center content-center h-13 w-13">
            <div
              class="transition-all duration-150 hover:h-13 hover:w-13 h-12 w-12 mx-auto text-center inline-flex items-center justify-center rounded-full text-white bg-gradient-to-r from-[#ffd600] to-[#beff00]"
            >
              <el-icon :size="22" class="cursor-pointer w-8 h-6">
                <GoodsFilled />
              </el-icon>
            </div>
          </div>
          <span class="text-0.8125 text-white font-semibold mt-3">Shop</span>
        </a>
      </div>
    </div>
  </el-popover>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { GoodsFilled, List, LocationFilled, Menu } from '@element-plus/icons-vue'
import Button from 'components/Button/index.vue'

export default defineComponent({
  name: 'PopoverMenu',
  components: {
    GoodsFilled,
    List,
    LocationFilled,
    Menu,
    Button,
  },
  props: {
    text: {
      type: String,
      default: 'Click',
      required: true,
    },
    round: {
      type: Boolean,
      default: false,
      required: true,
    },
    tabs: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  setup() {
    const clickIconMenu = ref(false)
    const route: any = useRoute()
    return {
      clickIconMenu,
      route,
    }
  },
})
</script>
<style scoped lang="scss"></style>
