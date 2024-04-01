<template>
  <el-dropdown placement="bottom-end" trigger="click" popper-class="profile-popper">
    <div class="flex flex-row items-center gap-1 md:gap-2 mb-1">
      <div class="pt-1">
        <el-link :underline="false">
          <el-avatar :size="37" class="cursor-pointer" :src="Logo_Url" />
        </el-link>
      </div>
      <div class="hidden lg:block">
        <h4>
          <el-link
            :underline="false"
            href="#index"
            class="text-sm font-semibold text-slate-50 hover:text-slate-300 pt-1"
            >Admin</el-link
          >
        </h4>
      </div>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item class="m-0 hover:bg-dark">
          <div class="flex items-center w-full pt-1 cursor-default">
            <h6 class="truncate m-0 text-white">WELCOME!</h6>
          </div>
        </el-dropdown-item>
        <el-dropdown-item class="mx-0 my-2 hover:bg-slate-100 text-zinc-800">
          <router-link to="/profile" class="flex flex-row items-center w-full h-6 mr-auto">
            <div class="flex w-auto">
              <el-icon :size="22" class="cursor-pointer w-5 h-6">
                <UserFilled />
              </el-icon>
            </div>
            <div class="basis-0 grow w-full ml-4">
              <span class="mb-0 text-sm font-normal">My profile</span>
            </div>
          </router-link>
        </el-dropdown-item>

        <el-dropdown-item
          divided
          class="mx-0 mt-2 hover:bg-slate-100 text-zinc-800"
          @click="handleLogoutClick"
        >
          <div class="flex flex-row items-center w-full h-6">
            <div class="flex w-auto">
              <el-icon :size="20" class="cursor-pointer w-5 h-6">
                <CircleClose />
              </el-icon>
            </div>
            <div class="basis-0 grow w-full ml-4">
              <span class="mb-0 text-sm font-normal">Logout</span>
            </div>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { CircleClose, UserFilled } from '@element-plus/icons-vue'
import useStore from 'store'
export default defineComponent({
  name: 'MenuUserAccount',
  components: {
    UserFilled,
    CircleClose,
  },
  setup() {
    const store = useStore()
    const handleLogoutClick = () => {
      store.auth.actLogout()
    }
    return {
      handleLogoutClick,
    }
  },
})
</script>
