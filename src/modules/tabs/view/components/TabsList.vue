<template>
  <div>
    <ul class="flex flex-nowrap justify-between pl-0 items-center">
      <li
        class="cursor-pointer mx-auto flex min-h-full items-center justify-center"

        v-for="tab in tabs"
        :key="tab.title"
        @click="activeTabHash = tab.hash"
      >
        <div
          class="h-full w-full"
          :class="{
            'bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 p-1':
              tab.hash === activeTabHash,
          }"
        >
          <div class="bg-blackOlive font-main text-white p-1">
            <div
              class="font-main px-6"
              :class="{
                'bg-gradient-to-t from-green-500 to-red-500 via-yellow-500 inline-block text-transparent bg-clip-text ':
                  tab.hash === activeTabHash,
              }"
            >
              {{ tab.title }}
            </div>
          </div>
        </div>
      </li>
    </ul>

    <slot />
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  data() {
    return {
      activeTabHash: "",
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
  // props: {
  //   tabs: {
  //     type: Array,
  //     required: true
  //   }
  // }
};
</script>
