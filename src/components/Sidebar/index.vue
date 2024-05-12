<template>
  <div class="flex flex-row">
    <div
      ref="target"
      aria-labelledby="primary-heading"
      class="transition-all duration-300 opacity-100 items-center"
      :class="{ ' hidden-aside ': isSidebarOpened }"
    >
      <div class="overflow-hidden">
        <el-menu
          ref="target"
          class="text-dark-20"
          :default-openeds="!leftSideBarItems.includes(route.name) ? ['1'] : ['0']"

        >
          <template v-for="(item, index) in menuItems" :key="index">
            <el-menu-item
              class="relative item"
              :class="{
                ' item-active': route.name === item.name,
                ' item-open': !isSidebarOpened,
              }"
              :index="`${index}`"
            >
              <template #title>
                <router-link
                  class="items-center w-full h-full text-sm my-0.5 font-normal transition-colors duration-150"
                  :class="{
                    ' text-gray-800 ': route.name === item.name,
                    ' ml-4.5 ': item.subOffset,
                  }"
                  :to="{ name: item.name }"
                  :title="item.title"
                >
                  <div>
                    <em class="h-5 w-6 block menu-item-inner">
                      <img
                        v-if="item.name === 'ValidatorsList'"
                        src="@/assets/icons/ValidatorsIcon.svg"
                        alt=""
                      />
                      <img
                        v-if="item.name === 'NetworksList'"
                        src="@/assets/icons/NetworksIcon.svg"
                        alt=""
                      />
                      <img
                        v-if="item.name === 'Metrics'"
                        src="@/assets/icons/MetricsIcon.svg"
                        alt=""
                      />
                      <img
                        v-if="item.name === 'Library'"
                        src="@/assets/icons/LibraryIcon.svg"
                        alt=""
                      />
                      <img
                        v-if="item.name === 'AboutUs'"
                        src="@/assets/icons/AboutUsIcon.svg"
                        alt=""
                      />
                      <img
                        v-if="item.name.includes('StakingCalculator')"
                        src="@/assets/icons/StakingIcon.svg"
                        alt=""
                      />
                    </em>
                  </div>
                  <span
                    class="transition-opacity duration-300 opacity-1 ml-3 text-sm font-normal"
                    :class="{ 'opacity-0': isSidebarOpened }"
                    >{{ item.title }}
                  </span>
                </router-link>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
      </div>
    </div>
    <div
      class="transition-opacity duration-300 opacity-1 bg-blackOlive w-7"
      @click="handleMenuClick"
    >
      <img
        src="@/assets/icons/ArrowsIcon.svg"
        class="cursor-pointer"
        :class="{ rotate: isSidebarOpened }"
        alt="Icons for toggle menu"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import navigation from './SidebarNav'
import useStore from 'store'

import env from 'core/env'

interface MenuItem {
  title: string
  icon: any
  path: string
  name: string
  color: string
  children: any
  requiresAuth: boolean
  subOffset?: boolean
}

export default defineComponent({
  name: 'Sidebar',
  components: {},
  setup() {
    const route = useRoute()
    const store = useStore()
    const menuItems = ref<MenuItem[]>(navigation)
    const isPagesMenuOpen = ref(false)
    const isSideMenuOpen = ref(false)
    const target = ref(null)
    const version = ref(env('VITE_APP_VERSION'))
    const documentHref = ref(env('VITE_DOCUMENT_ENDPOINT'))

    const leftSideBarItems = ref<any[]>(['Validators', 'Networks', 'Metrics'])

    const isSidebarOpened = computed<boolean>(() => store.dashboard.isSidebarOpened)

    const handleMenuClick = () => {
      store.dashboard.toggleMenu()
    }

    return {
      leftSideBarItems,
      isPagesMenuOpen,
      isSideMenuOpen,
      menuItems,
      route,

      isSidebarOpened,
      target,
      version,
      documentHref,

      handleMenuClick,
    }
  },
})
</script>
<style lang="scss" scoped>
.hidden-aside {
  @apply -translate-x-3/2 lg:translate-x-0 lg:block;
  width: 40px;
}
.menu-item-inner {
  display: flex;
  align-items: center;
}
.el-menu {
  .item-active {
    background-color: theme('colors.blackOlive') !important;
    border-radius: 0 !important;
    color: white !important;
  }

  .item {
    margin: 1rem 0;

    &:hover {
      background-color: theme('colors.blackOlive') !important;
      border-radius: 0 !important;
    }

    a {
      display: flex;
      align-items: center;
      padding: 1rem 0;
      color: white !important;
    }
  }

  .item-open {
    border-left: 1px solid theme('colors.blackOlive');
    border-bottom: 1px solid theme('colors.blackOlive');
    border-radius: 0 !important;
  }
}

.rotate {
  transform: rotate(180deg);
}
</style>
