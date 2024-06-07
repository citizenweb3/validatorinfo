<template>
  <div class="app">
    <ImageComponent class="column-left" />
    <div class="content column-right">
      <p class="title">Validator Info: The return of the Explorer... Soon-ish!</p>
      <p class="subtitle">
        We are working hard to ship you the alpha ASAP. In the meantime, please feel welcome to
        visit our
        <a href="https://github.com/citizenweb3/validatorinfo">GitHub repo</a> for the project and
        give us a <a href="https://x.com/therealvalinfo"> follow on X 🚀</a>
      </p>
    </div>
  </div>
</template>

<script>
import ImageComponent from './ImageComponent.vue'

export default {
  name: 'App',
  components: {
    ImageComponent,
  },
}
</script>

<style>
.app {
  display: grid;
  /* grid-template-columns: 1fr 1fr; */
  grid-template-columns: fit-content(70%) fit-content(80%);
  gap: 20px;
  position: relative;
  /* width: 100%; */
  align-items: center;
}

.title {
  color: theme('colors.americanYellow');
  font-family: 'Kode Mono', monospace;
  font-size: 50px;
}
.subtitle {
  color: theme('colors.white');
  font-size: 40px;
}
.content {
  border-radius: 10px;
  background-color: theme('colors.eerieBlack');
  padding: 20px;
  box-shadow: -3px 1px 20px theme('colors.americanYellow');
  border-radius: 10px;
  text-align: start;
  margin-top: 20%;
}
.column-left {
  z-index: 1;
}

.column-right {
  z-index: 2;
  transform: translateX(-15%);
}
</style>
