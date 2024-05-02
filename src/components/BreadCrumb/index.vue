<template>
  <div class="w-full">
    <el-breadcrumb separator="" class="w-fit flex align-bottom items-center border-bottom">
<!--      <el-breadcrumb-item>
        <div
          class="inline-block items-center text-h1 text-white"
          v-if="fullRoute[0]?.name !== 'AboutUs'"
        >
          About
        </div>
      </el-breadcrumb-item>-->
      <el-breadcrumb-item v-for="route in fullRouteResolved" :to="route.href">
        <div
          class="inline-block items-center cursor-pointer text-h1 text-americanYellow hover:text-white"
        >
          <span class="capitalize">{{ route.title }}</span>
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
