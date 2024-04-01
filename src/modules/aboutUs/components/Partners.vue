<template>
  <div class='main'>
    <div class='container'>
      <CentralLogo class="circle" />
      <div
        :class="'line line-' + index"
        v-for='(angle, index) in angles'
        :key='index'
        :style="{ transform: 'rotate(' + angle + 'deg)' }"
      >
        <div :class="'dot dot-' + index" :style="{ transform: 'rotate(-' + angle + 'deg)' }">
          <a :href='partners.data[index].link' target='_blankf'>
            <img
              v-if='partners.data[index]?.logo'
              :src='getAssetUrl(partners.data[index].logo)'
              height='88'
              width='86'
              :alt="'Logo' + partners.data[index].name"
            />
            <p class='text-americanYellow'>{{ partners.data[index]?.name }}</p>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { PartnersInfo } from '../store/types'
import useStore from 'store'
import { computed, Ref } from 'vue'
import CentralLogo from 'components/CentralLogo/index.vue'
import getAssetUrl from 'utils/getAssetUrl'

const store = useStore()
const partners: Ref<PartnersInfo> = computed(() => store.aboutUs.partners)
const angles = [23, 135, 255]
</script>

<style scoped lang='scss'>
.container {
  margin: 100px auto 0;
  position: relative;
  width: 300px;
  height: 300px;
}

.circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
}

.line {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  width: 2px;
  height: 50%;
  border: 2px dashed theme('colors.americanYellow');
}

.line-2 {
  left: 75%;
}

.line-1 {
  top: 35%;
  left: 30%;
}

.line-0 {
  top: 75%;
  left: 35%;
}

.dot {
  position: absolute;
  top: calc(50% + 10px);
  left: calc(50% + 1px);
  transform-origin: bottom;
  width: max-content;
}

.dot-2 {
  top: calc(20% - -46px);
  left: calc(20% - 94px);
}

.dot-1 {
  top: calc(50% + -40px);
  left: calc(50% + 10px);
}

.dot-0 {
  top: calc(50% + 50px);
  left: calc(50% + -30px);
}

.main {
  height: 736px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
