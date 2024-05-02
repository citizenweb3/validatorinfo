<template>
  <div class="flex items-center mx-0 py-2 pl-2.75 md:px-7.25 shadow-sm">
    <div class="w-full items-center justify-between">
      <div class="w-full flex basis-auto items-center">
        <div
          class="transition-all duration-300 mr-auto sm:mr-4 sm:transform-none sm:block overflow-hidden"
          :class="{ 'w-0 sm:w-full': isSearchOpen, 'w-full': !isSearchOpen }"
        >
          <SearchBar @close-search="setSearchOpen(true)" />
        </div>
        <div
          class="transition-all duration-300 flex flex-1 flex-row ml-0 md:ml-auto items-center mt-0 text-slate-50 gap-7.25 md:gap-7.5"
          :class="[!isSearchOpen ? 'w-0 overflow-hidden sm:flex' : 'w-full']"
        >
          <div class="relative inline-block lg:hidden text-white">
            <div class="flex items-center">
              <MenuIcon v-if="!isSBOpen" class="cursor-pointer h-6 w-6" @click="handleMenuClick" />
              <MenuAlt1Icon v-else class="cursor-pointer h-6 w-6" @click="handleMenuClick" />
            </div>
          </div>
          <div class="relative inline-block sm:hidden">
            <div class="flex items-center">
              <SearchCircleIcon
                v-if="!isSBPin && isSearchOpen"
                class="cursor-pointer w-4.5 h-4.5 text-slate-50 hover:text-slate-300"
                :class="{
                  'text-dark-lighter hover:text-indigo-410': route.meta.isDarkBackground,
                }"
                @click="setSearchOpen(false)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { Search, UserFilled, CircleClose } from '@element-plus/icons-vue'
import { MenuIcon, MenuAlt1Icon, SearchIcon, SearchCircleIcon } from '@heroicons/vue/outline'
import useStore from 'store'
import { useRoute } from 'vue-router'
import Dropdown from 'components/Dropdown/index.vue'
import PopoverMenu from 'components/PopOverMenu/index.vue'
import MenuUserAccount from 'components/MenuUserAccount/index.vue'
export default defineComponent({
  name: 'DefaultNav',
  components: {
    MenuUserAccount,
    PopoverMenu,
    Dropdown,
    Search,
    UserFilled,
    CircleClose,
    SearchIcon,
    MenuIcon,
    MenuAlt1Icon,
    SearchCircleIcon,
  },
  setup() {
    const route: any = useRoute()
    const store = useStore()
    const isPagesMenuOpen = ref(false)
    const isSideMenuOpen = ref(false)
    const isSearchOpen = ref(true)

    const togglePagesMenu = () => {
      isSideMenuOpen.value = !isSideMenuOpen.value
    }
    const closeSideMenu = () => {
      isSideMenuOpen.value = false
    }

    const isSBPin = computed(() => store.dashboard.isSBPin)
    const isSBOpen = computed(() => store.dashboard.isSBOpen)

    const handleMenuClick = () => {
      store.dashboard.toggleMenu()
    }

    const setSearchOpen = (v: boolean) => (isSearchOpen.value = v)

    return {
      isPagesMenuOpen,
      isSideMenuOpen,
      isSearchOpen,
      isSBPin,
      isSBOpen,
      route,
      handleMenuClick,
      setSearchOpen,
      togglePagesMenu,
      closeSideMenu,
    }
  },
})
</script>
