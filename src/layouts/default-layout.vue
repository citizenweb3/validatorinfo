<template>
  <Header />
  <SubHeader />
  <div class="h-screen flex w-full dark-theme pr-10" v-loading.fullscreen.lock="loading">
    <sidebar />
    <div class="main-content flex flex-col w-full overflow-auto main-content-dark">
      <div class="w-full h-38 relative bg-transparent border-none">
        <BreadCrumb :fullRoute="fullRoute" />

        <router-view v-slot="{ Component }">
          <component :is="Component" :class="{ 'py-1.25 px-4 md:px-7.5 lg:px-6.2': false }" />
        </router-view>
        <div class="w-full h-100 py-8 mx-auto px-4 md:px-7.5 lg:px-7.15">
          <Footer />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import useStore from 'store'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'Layout',

  setup() {
    const route = useRoute()
    const store = useStore()

    const loading = computed(() => store.global.loading)
    const fullRoute = computed(() => route.matched)

    const setSidebarClosed = (b: boolean) => store.dashboard.setSidebarClosed(b)
    return {
      loading,
      setSidebarClosed,
      fullRoute,
    }
  },
})
</script>

<style scoped>
.main-content {
  height: 100%;
  margin-bottom: 40px;
  padding: 0 3rem;
  @apply transition-all duration-300;
}

.main-content::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #f5f5f5;
}

/** Custom Scrollbar for main content **/
.main-content::-webkit-scrollbar {
  width: 6px;
  background-color: #f5f5f5;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: #000000;
}

@media screen and (max-width: 1023px) {
  .main-content {
    margin-left: 0 !important;
  }
}

/** Dark Theme **/
.main-content-dark {
  background-color: #1e1e1e !important;
}
</style>
