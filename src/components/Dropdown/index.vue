<template>
  <el-dropdown
    placement="bottom-end"
    trigger="click"
    popper-class="notification-popper"
    @visible-change="clickIconBell = !clickIconBell"
  >
    <div>
      <el-icon
        :size="40"
        class="cursor-pointer w-4.5 h-4.5 indigo-410 text-slate-50 hover:text-slate-300"
        :class="{
          'text-slate-300': clickIconBell,
          'text-dark-lighter hover:text-indigo-410': route.meta.isDarkBackground,
        }"
      >
        <BellFilled />
      </el-icon>
    </div>

    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item class="m-0 hover:bg-dark">
          <div class="flex items-center w-full py-2.5 cursor-default">
            <span class="text-sm text-slate-400 font-semibold m-0">
              You have <strong class="text-primary">13</strong> notifications.
            </span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item divided v-for="index in 5" :key="index">
          <div class="flex flex-row items-center w-full py-2.75">
            <div class="flex w-auto">
              <!--                        <el-avatar :size="48" :src="John_Snow_Url" />-->
            </div>
            <div class="basis-0 grow w-full ml-4">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="mb-0">John Snow</h4>
                </div>
                <div class="text-right">
                  <span class="text-90 font-normal text-gray-400">2 hrs ago</span>
                </div>
              </div>
              <p class="mb-0 text-sm leading-relaxed">Let's meet at Starbucks at 11:30. Wdyt?</p>
            </div>
          </div>
        </el-dropdown-item>
        <el-dropdown-item divided class="m-0">
          <div class="flex items-center w-full py-2">
            <a href="#!" class="mx-auto text-center text-primary font-semibold text-medium"
              >View all</a
            >
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { BellFilled } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'Dropdown',
  components: {
    BellFilled,
  },
  setup() {
    const clickIconBell = ref(false)
    const route: any = useRoute()

    return {
      clickIconBell,
      route,
    }
  },
})
</script>
<style scoped lang="scss"></style>
