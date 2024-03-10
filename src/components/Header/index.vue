<template>
  <div class="dark-theme-header header flex justify-between items-center p-4">
    <div class="navigations flex space-x-20">
      <p class="text-inherit">Validators: XXX</p>
      <p class="text-inherit">Ecosystems: XXX</p>
      <p class="text-inherit">TVL: XXX</p>
      <p class="text-inherit">Domicance: XXX</p>
      <p class="text-inherit">Cosmos: XX%</p>
      <p class="text-inherit">ETH: XX%</p>
      <p class="text-inherit">Polkadot: XX%</p>
    </div>
    <div class="controls flex justify-between">
      <button
        class="bg-blackOlive px-2 border border-gradient-apple-to-lust border-b border-b-3 hover"
      >
        <BrillianceIcon class="bg-blackOlive" />
      </button>
      <button
        class="bg-blackOlive px-2 border border-gradient-apple-to-lust ml-1 border-b border-b-3 hover"
      >
         <span
           class="bg-transparent"
           :class="{ 'active-text': isActive }"
           @click="toggleActive"
         >EN</span>
      </button>
      <button
        class="bg-blackOlive px-2 border border-gradient-apple-to-lust ml-1 border-b border-b-3 hover"
      >
        <span
          class="bg-transparent"
          :class="{ 'active-text': isActive }"
          @click="toggleActive"
        >USD</span
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BrillianceIcon from "@/components/Icons/brilliance.vue";
export default defineComponent({
  name: "Header",
  components: {
    BrillianceIcon,
  },
  data() {
    return {
      isActive: false,
    };
  },
  methods: {
    toggleActive() {
      this.isActive = !this.isActive;
    },
  },
});
</script>

<style scoped lang="scss">
.border-gradient-apple-to-lust {
  border: 2px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(
      180deg,
      theme("colors.lust"),
      theme("colors.apple")
  );
}

.hover {
  transition: text-shadow 0.3s ease;

  &:hover {
    text-shadow: 0px 0 10px gold;
  }
}
.active-text:active {
  color: gold;
}

svg:hover {
  filter: drop-shadow(0 0 5px gold);
}

/** Theme Dark **/
.dark-theme-header {
  background-color: #202020;
  color: white;
}
</style>
