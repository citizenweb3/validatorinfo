<template>
  <div class="w-full">
    <el-breadcrumb separator="" class="flex">
      <el-breadcrumb-item :to="{ path: '/' }">
        <div v-if="parentPath !== 'AboutUs'" class="inline-block items-center text-white text-h1">
          About
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item>
        <div class="inline-block items-center">
          <div>
            <el-link
              :underline="false"
              href="#!"
              class="hover:text-white font-semibold text-h1 text-americanYellow"
            >
              {{ parentPath }}
            </el-link>
          </div>
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { HomeFilled } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'BreadCrumb',
  components: {
    HomeFilled,
  },
  props: {
    parentPath: {
      type: String,
      default: '/',
    },
    title: {
      type: String,
      default: 'Default',
    },
  },
})
</script>
