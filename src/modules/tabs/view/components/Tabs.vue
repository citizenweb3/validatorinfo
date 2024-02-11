<template>
  <div class="">
    <ul class="flex flex-nowrap justify-between pl-0">
      <li
        class="
          w-full
          font-black
          text-center
          py-4
          cursor-pointer
          list-none
        "
        :class="{
          'bg-gradient-to-t from-lime-500 to-red-500': tab.hash === activeTabHash,
        }"
        v-for="tab in tabs"
        :key="tab.title"
        @click="activeTabHash = tab.hash"
      >
        {{ tab.title }}
      </li>
    </ul>
    <slot />
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  data() {
    return {
      activeTabHash: '',
      tabs: [],
    };
  },
  provide() {
    return {
      addTab: (tab) => {
        const count = this.tabs.push(tab);

        if (count === 1) {
          this.activeTabHash = tab.hash;
        }
      },
      activeTabHash: computed(() => this.activeTabHash),
    };
  },
};
</script>
