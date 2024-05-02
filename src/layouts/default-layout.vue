<template>
  <Header />
  <div
    class="h-screen overflow-hidden flex w-full dark-theme pr-10"
    v-loading.fullscreen.lock="loading"
  >
    <sidebar />
    <div
      class="main-content flex flex-col flex-1 w-full overflow-auto main-content-dark"
      :class="`${!isSBPin ? ' ml-17 ' : 'ml-62.5 cursor-pointer lg:cursor-default'}`"
    >
      <navigation />
      <div
        class="w-full h-38 relative bg-transparent border-none"
        :class="{
          'bg-indigo-410': false,
        }"
      >
        <div class="flex items-center py-5 mb-0 pt-6" v-if="fullRoute.length <= 1">
          <div class="w-full flex flex-wrap flex-row">
            <div class="flex w-full flex-col">
              <div class="md:ml-7 hidden md:inline-block pt-1.5">
                <BreadCrumb :fullRoute="fullRoute" />
              </div>
            </div>
          </div>
        </div>

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
    const isSBPin = computed<boolean>(() => store.dashboard.isSBPin)
    const loading = computed(() => store.global.loading)
    const fullRoute = computed(() => route.matched)
    const setIsSBPin = (b: boolean) => store.dashboard.setIsSBPin(b)
    return {
      isSBPin,
      loading,
      setIsSBPin,
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


.main-content::-webkit-scrollbar-track
{
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	background-color: #F5F5F5;
}

/** Custom Scrollbar for main content **/
.main-content::-webkit-scrollbar
{
	width: 6px;
	background-color: #F5F5F5;
}

.main-content::-webkit-scrollbar-thumb
{
	background-color: #000000;
}

@media screen and (max-width: 1023px) {
  .main-content {
    margin-left: 0 !important;
  }
}

/** Dark Theme **/
.main-content-dark {
  background-color: #1E1E1E!important;
}
</style>
