<template>
  <div class="flex items-center shadow-sm w-full">
    <div class="w-full items-center justify-between">
      <div class="w-full flex basis-auto items-center">
        <div class="w-full">
          <SearchBar @close-search="setSearchOpen(false)" />
        </div>
        <div class="flex flex-1 items-center text-slate-50">
          <div class="relative inline-block sm:hidden">
            <div class="flex items-center">
              <SearchCircleIcon
                v-if="!isSidebarClosed && isSearchOpen"
                class="cursor-pointer text-slate-50 hover:text-slate-300"
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
export default defineComponent({
  name: 'Search',
  components: {
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

    const isSidebarClosed = computed(() => store.dashboard.isSidebarClosed)
    const isSidebarOpened = computed(() => store.dashboard.isSidebarOpened)

    const setSearchOpen = (v: boolean) => (isSearchOpen.value = v)

    return {
      isPagesMenuOpen,
      isSideMenuOpen,
      isSearchOpen,
      isSidebarClosed,
      isSidebarOpened,
      route,
      setSearchOpen,
      togglePagesMenu,
      closeSideMenu,
    }
  },
})
</script>
<style lang="scss">
.triangle {
  width: 0;
  height: 10px;
  border-left: 10px solid transparent; /* Измените значение ширины, если нужно */
  border-right: 10px solid transparent; /* Измените значение ширины, если нужно */
  border-bottom: 10px solid red;
}
</style>
