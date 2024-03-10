<template>
<div class='wrapper'>
  <div class="title py-3 text-white">{{label.toUpperCase()}}:</div>
  <div class="content">{{content}}</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "contentItem",
  components: {},
  props: {
    label: {
      type: String,
      default: "label",
    },
    content: {
      type: String,
    },
  },
});
</script>

<style scoped lang="scss">
* {
  //font-family: "Inter";
  font-family: "Kode Mono", monospace;
}
.title {
  font-weight: 600;
}
.content{ font-weight: 300}
.dark-theme {
  .content {
    color: white;
    font-size: 0.95rem;
  }
}
</style>
