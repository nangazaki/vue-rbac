<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useRBAC } from '@nangazaki/vue-rbac'
import { PhCode, PhShieldCheck, PhStack, PhSignOut } from '@phosphor-icons/vue'

const router = useRouter()
const route = useRoute()
const { currentRole, logout } = useAuth()
const { setUserRoles } = useRBAC()

onMounted(() => {
  if (currentRole.value) setUserRoles(currentRole.value)
})

function handleLogout() {
  logout()
  router.push('/login')
}

const navItems = [
  { label: 'Directives', path: '/dashboard', icon: PhCode },
  { label: 'RbacGuard', path: '/dashboard/guard', icon: PhShieldCheck },
  { label: 'Composable', path: '/dashboard/composable', icon: PhStack },
]

const roleColors: Record<string, string> = {
  admin: 'bg-cyan-100 text-cyan-800',
  editor: 'bg-violet-100 text-violet-800',
  viewer: 'bg-slate-100 text-slate-700',
}
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <aside class="w-64 bg-gradient-to-b from-cyan-600 to-cyan-900 flex flex-col shrink-0">
      <div class="p-6 border-b border-white/10">
        <h1 class="text-white font-bold text-lg leading-tight">Vue RBAC</h1>
        <p class="text-cyan-200 text-xs mt-1">Playground</p>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
            route.path === item.path
              ? 'bg-white/20 text-white'
              : 'text-cyan-100 hover:bg-white/10 hover:text-white',
          ]"
        >
          <component :is="item.icon" :size="16" weight="duotone" />
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="p-4 border-t border-white/10 space-y-3">
        <div class="flex items-center gap-3 px-2">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold uppercase">
            {{ currentRole?.[0] }}
          </div>
          <div>
            <p class="text-white text-sm font-medium capitalize">{{ currentRole }}</p>
            <span :class="`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[currentRole ?? '']}`">
              active role
            </span>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-cyan-100 hover:bg-white/10 hover:text-white text-sm transition-colors"
        >
          <PhSignOut :size="16" />
          Switch role
        </button>
      </div>
    </aside>

    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>
