<template>
  <div class="titleWrapper">
    <p class="title">{{ data.title }}</p>
  </div>
  <p
    v-for="(item, indexDescription) in data.data.description"
    :key="indexDescription"
    class="text-white pt-6"
  >
    {{ item }}
  </p>
  <div class="contentWrapper mt-4">
    <div
      v-for="(item, indexSection) in data.data.section"
      :key="indexSection"
      class="contentItem mt-5"
    >
      <p class="text-americanYellow text-base font-semibold">{{ item.title }}</p>
      <div class="my-5">
        <div class="border-gradient-apple-to-lust px-40 m-1 bg-blackOlive w-full h-5 relative">
          <button
            class="text-americanYellow bg-eerieBlack border-2 absolute w-full bottom-1.5 rounded-md left-0 border-gradient-apple-to-lust hover:border-gradient-apple-to-lust hover:border-b-3"
          >
            {{ item.textButton }}
          </button>
        </div>
      </div>
      <!--      <ContentItem :label="item.title" :content="item.content" />-->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useStore from 'store'
import { GeneralInfo } from 'modules/aboutUs/store/types'
import ContentItem from 'modules/aboutUs/components/ContentItem.vue'
const store = useStore()

export default defineComponent({
  name: 'AboutUsGeneral',
  components: {
    ContentItem,
  },
  props: {
    title: {
      type: String,
      default: 'General tabs',
    },
  },
  setup() {
    const data: GeneralInfo = store.aboutUs.general

    return {
      data,
    }
  },
})
</script>

<style scoped lang="scss">
.title {
  color: theme('colors.americanYellow');
  font-size: 24px;
  border-bottom: 1px solid theme('colors.blackOlive');
  width: fit-content;
}
.contentItem {
  border: none;

  &:not(:first-of-type) {
    border-top: 1px solid theme('colors.blackOlive');
  }
}
.border-gradient-apple-to-lust {
  border-image-slice: 1;
  border-image-source: linear-gradient(180deg, theme('colors.lust'), theme('colors.apple'));
  border-radius: 10px;
}

.hover {
  transition: text-shadow 0.3s ease;

  &:hover {
    text-shadow: 0px 0 10px theme('colors.americanYellow');
  }
}
.active-text:active {
  color: theme('colors.americanYellow');
}
</style>
