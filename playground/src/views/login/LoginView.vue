<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAuth, type PlaygroundRole } from '@/composables/useAuth'
import { useRBAC } from '@nangazaki/vue-rbac'
import { PhArrowRight, PhShieldStar, PhPencilLine, PhEye } from '@phosphor-icons/vue'

const router = useRouter()
const { login } = useAuth()
const { setUserRoles } = useRBAC()

const roles = [
  {
    id: 'admin' as PlaygroundRole,
    label: 'Admin',
    description: 'Full access to all resources',
    permissions: ['create:posts', 'delete:posts', 'read:posts', 'update:posts'],
    gradient: 'from-indigo-500 to-violet-600',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
    hover: 'hover:border-indigo-300 hover:bg-indigo-50/50',
    arrow: 'group-hover:text-indigo-500',
    icon: PhShieldStar,
  },
  {
    id: 'editor' as PlaygroundRole,
    label: 'Editor',
    description: 'Can edit and read posts',
    permissions: ['update:posts', 'read:posts'],
    gradient: 'from-sky-500 to-cyan-600',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600',
    badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
    hover: 'hover:border-sky-300 hover:bg-sky-50/50',
    arrow: 'group-hover:text-sky-500',
    icon: PhPencilLine,
  },
  {
    id: 'viewer' as PlaygroundRole,
    label: 'Viewer',
    description: 'Read-only access',
    permissions: ['read:posts'],
    gradient: 'from-teal-500 to-emerald-600',
    iconBg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
    badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-100',
    hover: 'hover:border-teal-300 hover:bg-teal-50/50',
    arrow: 'group-hover:text-teal-500',
    icon: PhEye,
  },
]

function loginAs(role: PlaygroundRole) {
  login(role)
  setUserRoles(role)
  router.push('/dashboard')
}
</script>

<template>
  <div class="w-full h-screen flex bg-gray-50">
    <!-- Left panel -->
    <div class="hidden lg:flex w-[45%] h-full relative overflow-hidden bg-gradient-to-br from-cyan-500 to-cyan-900 flex-col items-center justify-center p-16">
      <!-- background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
      </div>

      <div class="relative text-white text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-8 backdrop-blur-sm ring-1 ring-white/20">
          <PhShieldStar :size="32" weight="duotone" />
        </div>
        <h1 class="text-5xl font-bold mb-4 tracking-tight">Vue RBAC</h1>
        <p class="text-lg text-white/70 mb-10">Interactive Playground</p>

        <div class="space-y-3 text-left max-w-xs mx-auto">
          <div v-for="item in ['Directives', 'RbacGuard Component', 'useRBAC Composable']" :key="item"
            class="flex items-center gap-3 text-sm text-white/80">
            <div class="w-1.5 h-1.5 rounded-full bg-violet-300 shrink-0" />
            {{ item }}
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-10">
      <div class="w-full max-w-sm">
        <div class="mb-10">
          <p class="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Get started</p>
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Choose a role</h2>
          <p class="text-gray-500 text-sm">Each role has different permissions. Select one to explore.</p>
        </div>

        <div class="space-y-3">
          <button
            v-for="role in roles"
            :key="role.id"
            @click="loginAs(role.id)"
            :class="`w-full text-left p-4 rounded-2xl border border-gray-200 bg-white transition-all group ${role.hover}`"
          >
            <div class="flex items-center gap-4">
              <div :class="`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${role.iconBg}`">
                <component :is="role.icon" :size="22" weight="duotone" :class="role.iconColor" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 text-sm mb-1">{{ role.label }}</p>
                <p class="text-xs text-gray-400 mb-2">{{ role.description }}</p>
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="perm in role.permissions"
                    :key="perm"
                    :class="`text-xs px-2 py-0.5 rounded-full font-mono ${role.badge}`"
                  >
                    {{ perm }}
                  </span>
                </div>
              </div>
              <PhArrowRight :size="18" :class="`text-gray-300 transition-colors shrink-0 ${role.arrow}`" />
            </div>
          </button>
        </div>

        <p class="mt-8 text-center text-xs text-gray-400">
          Vue RBAC Playground — for development use only
        </p>
      </div>
    </div>
  </div>
</template>
