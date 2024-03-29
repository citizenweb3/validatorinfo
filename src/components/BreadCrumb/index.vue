<template>
  <div class="w-full">
    <el-breadcrumb separator="" class="w-full flex align-bottom items-center">
      <el-breadcrumb-item :to="{ path: '/' }">
        <div class="inline-block items-center">
          <el-icon :size="16" class="cursor-pointer w-6 h-6 text-white hover:text-slate-300">
            <HomeFilled />
          </el-icon>
        </div>
      </el-breadcrumb-item>
      <el-breadcrumb-item v-for='route in fullRouteResolved' :to='route.href'>
        <div class="inline-block items-center cursor-pointer text-sm text-white hover:text-slate-300 font-semibold">
          <span class='capitalize'>{{ route.title }}</span>
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRouter()
const props = defineProps({
  fullRoute: {
    type: Object,
    default: null,
  },
})

const fullRouteResolved = computed(() =>
  props.fullRoute
    ?.flatMap((r: any) => {
      return [
        ...(r.meta.parentPath ? [r.meta.parentPath] : []),
        {
          title: r.meta.title?.includes(':')
            ? route.currentRoute.value.params[r.meta.title.split(':')[1]]
            : r.meta.title,
          href: r.path
            .split('/')
            .map((d: string) => {
              return d.includes(':') ? route.currentRoute.value.params[d.split(':')[1]] : d
            })
            .join('/'),
        },
      ]
    })
    .filter((d: { title: any }) => !!d.title),
)
</script>
