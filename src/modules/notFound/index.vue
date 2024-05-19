<template>
  <div class="min-h-full flex flex-col py-4">
    <div class="wrapper">
      <div class="containter">
        <div class="flex flex-row items-center">
          <span class="font-semibold text-americanYellow text-66"
            ><svg
              width="30"
              height="19"
              viewBox="0 0 30 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.26562 18.7344V15.0918H9.72461V11.459H0.632812V7.82617H9.72461V4.18359H4.26562V0.550781H13.3574V4.18359H17V0.550781H26.082V4.18359H20.6328V7.82617H29.7246V11.459H20.6328V15.0918H26.082V18.7344H17V15.0918H13.3574V18.7344H4.26562Z"
                fill="#F3B101"
              />
            </svg>
          </span>
          <h1 class="font-semibold text-americanYellow text-3xl">&nbsp;Keep it calm</h1>
        </div>
        <p class="font-semibold text-white text-3xl">We are validating the situation!</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: '404',
})
</script>
<style lang="scss" scoped>
.wrapper {
  background-image: url('@/assets/images/404.png');
  background-repeat: no-repeat;
  background-size: auto;
  width: auto;
  height: 593px;
  position: relative;
}
.containter {
  width: auto;
  height: auto;
  position: absolute;
  top: 35%;
  left: 45%;
  box-shadow: 0px 0px 10px 5px theme('colors.americanYellow');
  background-color: theme('colors.eerieBlack');
  padding: 20px;
}
</style>
