<template>
  <el-popover :effect="'dark'" :visible="visible" :show-arrow="false" popper-class="modal-popper">
    <template #reference>
      <Button :text="text" @click="visible = !visible" round />
    </template>
    <div class="w-full m-0 flex h-auto" @click="closeModal">
      <div class="flex flex-wrap m-0 relative">
        <div v-html="htmlContent"></div>
        <div class="close-icon absolute right-1" @click.stop.prevent="closeModal">
          <icon-base icon-name="close" width="40" height="40"><icon-close /></icon-base>
        </div>
      </div>
    </div>
  </el-popover>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { GoodsFilled, List, LocationFilled, Menu } from '@element-plus/icons-vue'
import Button from 'components/Button/index.vue'

export default defineComponent({
  name: 'PopoverMenu',
  components: {
    GoodsFilled,
    List,
    LocationFilled,
    Menu,
    Button,
  },
  props: {
    text: {
      type: String,
      default: 'Click',
      required: true,
    },
    round: {
      type: Boolean,
      default: false,
      required: true,
    },
    tabs: {
      type: Boolean,
      default: true,
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
  },
  setup() {
    const visible = ref(false)

    const route: any = useRoute()
    return {
      route,
      visible,
    }
  },

  methods: {
    closeModal() {
      this.visible = false
    },
  },
})
</script>
<style scoped lang="scss"></style>
