<template>
  <div class="w-full flex align-bottom items-center">
    <div class="text-white mr-4">About</div>
    <el-breadcrumb separator="" class="flex">
      <el-breadcrumb-item v-for="route in fullRouteResolved" :to="route.href">
        <div
          class="inline-block items-center cursor-pointer text-sm text-americanYellow text-h2 hover:text-slate-300 font-semibold"
        >
          {{ route.title }}
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'

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
