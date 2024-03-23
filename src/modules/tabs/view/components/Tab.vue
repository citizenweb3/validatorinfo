<template>
  <div class="px-8" v-show="isActive">
    <slot />
  </div>

</template>

<script>
export default {
  inject: ['addTab', 'activeTabHash'],
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  data() {
    return { hash: '', isActive: false };
  },
  created() {
    this.hash = '#' + this.title.toLowerCase().replace(/ /g, '-');
    this.addTab({
      title: this.title,
      hash: this.hash,
    });
  },
  watch: {
    activeTabHash() {

      this.isActive = this.activeTabHash === this.hash;
      console.log('test', {isActive: this.isActive, activeTabHash: this.activeTabHash, hash: this.hash});
    },
  },
};
</script>
