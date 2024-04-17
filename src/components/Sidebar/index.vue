<template>
  <aside
    ref="target"
    @mouseover="hoverLeftBar(true)"
    @mouseleave="hoverLeftBar(false)"
    aria-labelledby="primary-heading"
    class="transition-all duration-300 fixed z-20 bg-dark flex-shrink-0 overflow-hidden h-full items-center"
    :class="{ ' hidden-aside w-17 ': !isSBOpen && !isSBPin }"
  >
    <div class="flex flex-col mx-auto items-stretch h-full">
      <small class="absolute pl-2 left-0 bottom-0 italic text-cyan-800">v{{ version }}</small>
      <div class="h-19.5 flex items-center relative">
        <router-link
          v-if="(isSBOpen && !isSBPin) || isSBPin"
          :class="{ 'opacity-0': !isSBOpen && !isSBPin }"
          class="transition-opacity duration-300 opacity-1 p-6 block"
          :to="{ name: 'ValidatorInfo' }"
        >
          <img
            src="@/assets/ValidatorInfoLogo.png"
            class="max-h-24 max-w-full align-middle"
            alt="..."
          />
        </router-link>
        <div class="ml-auto">
          <div class="lg:col-span-10 xl:col-span-10 flex">
            <div class="hidden lg:block flex-grow">
              <div class="flex items-center space-x-2 2xl:space-x-4 text-white px-6">
                <img src="@/assets/icons/ArrowsIcon.svg" class="cursor-pointer h-6 w-5" @click="handleMenuClick" alt=''>

                <!-- Template Icons
                  <MenuIcon v-if="!isSBPin" class="cursor-pointer h-6 w-5" @click="handleMenuClick" />
                  <MenuAlt1Icon v-else class="cursor-pointer h-6 w-5" @click="handleMenuClick" />
                -->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex-1 overflow-y-hidden">
        <el-scrollbar>
          <el-menu
            ref="target"
            class="text-dark-20 before:block before:md:mt-4 mt-0"
            default-active="0"
            :default-openeds="!leftSideBarItems.includes(route.name) ? ['1'] : ['0']"
          >
            <template v-for="(item, index) in menuItems" :key="index">
                <el-menu-item
                  class="relative mx-2"
                  :class="{
                    'item-active': route.name === item.name,
                  }"
                  :index="`${index}`"
                >
                  <template #title>
                    <span
                      v-if="route.name === item.name"
                      class="absolute inset-y-1 -left-2 w-0.5 h-5/6 bg-indigo-410"
                      aria-hidden="true"
                    />
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
                             alt=''/>
                            <img
                              v-if="item.name === 'NetworksList'"
                              src="@/assets/icons/NetworksIcon.svg"
                             alt=''/>
                            <img v-if="item.name === 'Metrics'" src="@/assets/icons/MetricsIcon.svg"  alt=''/>
                            <img v-if="item.name === 'Library'" src="@/assets/icons/LibraryIcon.svg"  alt=''/>
                            <img v-if="item.name === 'AboutUs'" src="@/assets/icons/AboutUsIcon.svg"  alt=''/>
                            <img
                              v-if="item.name === 'StakingCalculator'"
                              src="@/assets/icons/StakingIcon.svg"
                             alt=''/>
                        </em>
                      </div>
                      <span
                        class="transition-opacity duration-300 opacity-1 ml-3 text-sm font-normal"
                        :class="{ 'opacity-0': !isSBOpen && !isSBPin }"
                        >{{ item.title }}
                      </span>
                    </router-link>
                  </template>
                </el-menu-item>
              </template>
          </el-menu>
        </el-scrollbar>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import navigation from './SidebarNav'
import useStore from 'store'
import { onClickOutside } from '@vueuse/core'
import env from 'core/env'
import { checkIsMobile } from 'utils/index'

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
  components: {
  },
  setup() {
    const route = useRoute()
    const store = useStore()
    const menuItems = ref<MenuItem[]>(navigation)
    const isPagesMenuOpen = ref(false)
    const isSideMenuOpen = ref(false)
    const target = ref(null)
    const version = ref(env('VITE_APP_VERSION'))
    const documentHref = ref(env('VITE_DOCUMENT_ENDPOINT'))
    const isMobile = checkIsMobile()
    const leftSideBarItems = ref<any[]>(['Validators', 'Networks', 'Metrics'])

    const handleOnResize = () => {
      if (window.innerWidth < 1024) {
        store.dashboard.setIsSBOpen(false)
        store.dashboard.setIsSBPin(false)
      }
    }

    onClickOutside(target, (_) => {
      if (window.innerWidth < 1024) store.dashboard.setIsSBOpen(false)
    })
    onBeforeMount(() => {
      if (isMobile || window.innerWidth < 1024) {
        store.dashboard.setIsSBOpen(false)
        store.dashboard.setIsSBPin(false)
      }
    })
    onMounted(() => {
      window.addEventListener('resize', handleOnResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleOnResize)
    })

    const isSBPin = computed<boolean>(() => store.dashboard.isSBPin)
    const isSBOpen = computed<boolean>(() => store.dashboard.isSBOpen)

    const hoverLeftBar = (v: boolean) => {
      if (!isMobile && window.innerWidth > 1023) store.dashboard.setIsSBOpen(v)
    }

    const handleMenuClick = () => {
      store.dashboard.toggleMenu()
    }

    return {
      leftSideBarItems,
      isPagesMenuOpen,
      isSideMenuOpen,
      menuItems,
      route,
      isSBPin,
      isSBOpen,
      target,
      version,
      documentHref,
      hoverLeftBar,
      handleMenuClick,
    }
  },
})
</script>
<style scoped>
.hidden-aside {
  @apply -translate-x-3/2 lg:translate-x-0 lg:block;
}
.menu-item-inner {
  display: flex;
  align-items: center;
}
.el-menu {
  .is-active {
    background-color: #3E3E3E;
    border-radius: 0!important;
  }
}
.el-menu-item {
    border-left: 1px solid #3E3E3E;
    border-bottom: 1px solid #3E3E3E;
    margin: 1rem 0;
    &:hover {
      background-color: #3E3E3E!important;
      border-radius: 0!important;
    }
    a {
      display: flex;
      align-items: center;
      padding: 1rem 0;
      &:hover {
        color: white!important;
      }
    }
    a.router-link-exact-active {
      color: white!important;
    }
}
</style>
