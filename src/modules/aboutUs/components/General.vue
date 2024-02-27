<template>
  <div class="titleWrapper"><p class="title">{{data.title}}</p></div>
  <div class="contentWrapper mt-4" >
    <div v-for="(item, index) in data.data" :key="index" class='contentItem mt-5'>
      <ContentItem :label="item.label" :content="item.content" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useStore from "store";
import { GeneralInfo } from "modules/aboutUs/store/types";
import ContentItem from "modules/aboutUs/components/ContentItem.vue";
const store = useStore();

export default defineComponent({
  name: "General",
  components: {
    ContentItem,
  },
  props: {
    title: {
      type: String,
      default: "General tabs",
    },
  },
  setup() {
    const data: GeneralInfo = store.aboutUs.general;

    return {
      data,
    };
  },
});
</script>

<style scoped lang="scss">
.title {
  color: theme("colors.americanYellow");
  font-size: 24px;
  border-bottom: 1px solid theme("colors.blackOlive");
  width: fit-content;
}
.contentItem{
border: none;

  &:not(:first-of-type) {
    border-top: 1px solid theme("colors.blackOlive");
  }
}

</style>
