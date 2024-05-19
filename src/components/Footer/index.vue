<template>
  <div class="wrapper">
    <div class="links">
      <a class="icon" href="https://www.citizenweb3.com/">
        <img height="40px" width="40px" src="@/assets/logos/citizen.png" alt="" />
      </a>
      <a href="https://github.com/citizenweb3" class="mx-2 icon">
        <img src="@/assets/icons/github-mark-white.svg" alt="" />
      </a>
      <a class="circle icon x" href="https://twitter.com/therealvalinfo">
        <img src="@/assets/icons/x.svg" alt="" />
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Footer',
  setup() {
    return {}
  },
})
</script>

<style scoped lang="scss">
.wrapper {
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}
.links {
  display: flex;
  flex-direction: row;
}
.icon {
  height: 40px;
  width: 40px;
}
.circle {
  border: 2px solid white;
  border-radius: 50%;
  padding: 5px;
  padding-left: 3px;
  padding-top: 3px;
}
</style>
