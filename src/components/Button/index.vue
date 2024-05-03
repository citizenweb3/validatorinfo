<script lang="ts">
import { computed, defineComponent } from 'vue'
import getAssetUrl from 'utils/getAssetUrl'

export default defineComponent({
  name: 'Button',

  props: {
    text: {
      type: String,
      default: 'Click',
      required: false,
    },
    round: {
      type: Boolean,
      default: false,
    },
    tabs: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
    },
    activeButtonIndex: Number,
    index: Number,
    textWhite: {
      type: Boolean,
      default: false,
    },
    img: {
      type: String,
    },
  },
  setup(props) {
    const activeClass = computed(() => props.activeButtonIndex === props.index && props.tabs)

    return {
      iconResolved: props.icon && getAssetUrl(props.icon),
      imgResolved: props.img && getAssetUrl(props.img),
      activeClass,
    }
  },
})
</script>

<template>
  <button class="wrapper">
    <div class="backyard">
      <div
        :class="{
          rounded: round,
          'module-border-wrap': !tabs,
          active: activeClass,
        }"
      >
        <div class="module outer" :class="{ rounded: round }" />
      </div>
    </div>
    <div
      :class="{
        rounded: round,
        tabs: tabs,
        'module-border-wrap': !tabs,
        active: activeClass,
      }"
    >
      <div class="module" :class="{ rounded: round }">
        <div
          :class="{
            textdecoration: !tabs,
            text: tabs && activeClass,
            iconWrap: icon,
            textWhite: textWhite,
          }"
        >
          <template v-if="iconResolved">
            <img :src="iconResolved" />
          </template>
          <template v-else-if="imgResolved">
            {{ text }}
            <img :src="imgResolved" class="max-h-24 max-w-full align-middle" />
          </template>
          <template v-else>
            {{ text }}
          </template>
        </div>
      </div>
    </div>
  </button>
</template>

<style scoped lang="scss">
.textdecoration {
  font-size: 1rem;
  color: theme('colors.americanYellow');
  text-shadow: 0 0 0.5rem theme('colors.americanYellow'), 0 0 0.5rem theme('colors.americanYellow'),
    0 0 2rem theme('colors.americanYellow');
  height: 100%;
}

.text {
  font-size: 1.1rem;
  background-image: linear-gradient(to bottom, theme('colors.lust'), theme('colors.apple'));
  -webkit-background-clip: text;
  color: transparent;
  width: auto;
}
.backyard {
  width: 100%;
  position: absolute;
  top: 0.5rem;
}
.module-border-wrap {
  width: 100%;
  position: relative;
  background: linear-gradient(to bottom, theme('colors.lust'), theme('colors.apple'));
  padding: 2px;
  height: 100%;
}
.outer {
  background-color: #535151 !important;
}

.module {
  background: theme('colors.eerieBlack');
  padding: 0 1.2rem;
  text-align: center;
  height: 100%;
}
.rounded {
  border-radius: 1rem !important;
}
.wrapper {
  width: fit-content;
  position: relative;
  padding-bottom: 1rem;
}
.tabs {
  padding-bottom: 0.5rem;
  border-bottom: 1px solid theme('colors.blackOlive');
  border-left: 1px solid theme('colors.blackOlive');
  color: white;
  font-size: 1rem;
  &:not(.active) {
    padding: 0.5rem;
  }
}

.active {
  width: 100%;
  position: relative;
  background: linear-gradient(to bottom, theme('colors.lust'), theme('colors.apple'));
  padding: 2px;
  box-shadow: 0 0 10px theme('colors.americanYellow');
}

.iconWrap {
  padding: 0.3rem 0 0;
  align-self: stretch !important;
  width: 1rem;
}

.textWhite {
  color: white;
}
</style>
