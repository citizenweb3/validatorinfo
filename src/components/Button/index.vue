<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'Button',

  props: {
    text: {
      type: String,
      default: 'Click',
      required: false,
    },
    isRound: {
      type: Boolean,
      default: false,
      required: true,
    },
    isButton: {
      type: Boolean,
      default: true,
      required: true,
    },
    isTabs: {
      type: Boolean,
      default: false,
    },
    isIcon: {
      type: Boolean,
      default: false,
    },
    activeButtonIndex: Number,
    index: Number,
    isTextWhite: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const activeClass = computed(() => props.activeButtonIndex === props.index && props.isTabs)

    return {
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
          rounded: isRound,
          'module-border-wrap': isButton,
          active: activeClass,
        }"
      >
        <div class="module outer" :class="{ rounded: isRound }" />
      </div>
    </div>
    <div
      :class="{
        rounded: isRound,
        tabs: isTabs,
        'module-border-wrap': isButton,
        active: activeClass,
      }"
    >
      <div class="module" :class="{ rounded: isRound }">
        <div
          :class="{
            textdecoration: isButton,
            text: isTabs && activeClass,
            iconWrap: isIcon,
            textWhite: isTextWhite,
          }"
        >
          <template v-if="isIcon">
            <img src="/public/icons/brilliance.svg" />
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
  font-size: 18px;
  color: theme('colors.americanYellow');
  text-shadow: 0 0 10px theme('colors.americanYellow'), 0 0 20px theme('colors.americanYellow'),
    0 0 30px theme('colors.americanYellow');
  height: 100%;
}

.text {
  font-size: 20px;
  background-image: linear-gradient(to bottom, theme('colors.lust'), theme('colors.apple'));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  width: auto;
}
.backyard {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 5px;
}
.module-border-wrap {
  width: 100%;
  position: relative;
  background: linear-gradient(to bottom, theme('colors.lust'), theme('colors.apple'));
  padding: 3px;
  height: 100%;
}
.outer {
  background-color: #535151 !important;
}

.module {
  background: theme('colors.eerieBlack');
  padding: 0 12px;
  text-align: center;
  height: 100%;
}
.rounded {
  border-radius: 16px !important;
}
.wrapper {
  position: relative;
}
.tabs {
  width: 200px;
  padding-bottom: 10px;
  border-bottom: 1px solid theme('colors.blackOlive');
  border-left: 1px solid theme('colors.blackOlive');
  color: white;
}

.active {
  width: 100%;
  position: relative;
  background: linear-gradient(to bottom, theme('colors.lust'), theme('colors.apple'));
  padding: 3px;
  height: 100%;
  box-shadow: 0 0 10px theme('colors.americanYellow');
}

.iconWrap {
  padding-top: 5px;
  align-self: center;
}

.textWhite {
  color: white;
}
</style>
