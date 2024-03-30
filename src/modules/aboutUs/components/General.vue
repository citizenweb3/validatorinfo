<template>
  <div class="titleWrapper">
    <p class="title">{{ data.title }}</p>
  </div>
  <p
    v-for="(item, indexDescription) in data.data.description"
    :key="indexDescription"
    class="text-white pt-6 text-4"
  >
    {{ item }}
  </p>
  <div class="mt-4 wrapper">
    <div v-for="(item, indexSection) in data.data.section" :key="indexSection" class="mt-5 mr-5.5">
      <p class="text-americanYellow text-base font-semibold text-h3 pb-15 border-bottom w-fit">
        {{ item.title }}
      </p>
      <div class="item mt-15 ml-5.5">
        <PopoverMenu :text="item.textButton" :round="true" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useStore from 'store'
import { GeneralInfo } from 'modules/aboutUs/store/types'
import ContentItem from 'modules/aboutUs/components/ContentItem.vue'
import Button from 'components/Button/index.vue'
const store = useStore()

export default defineComponent({
  name: 'AboutUsGeneral',
  components: {
    Button,
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
.wrapper {
  display: flex;
  flex-direction: row;
}
.item {
  height: 30px;
  width: 144px;
}
</style>
