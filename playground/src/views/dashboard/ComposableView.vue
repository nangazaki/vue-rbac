<script lang="ts" setup>
import { useRBAC } from '@nangazaki/vue-rbac'
import { useAuth, type PlaygroundRole } from '@/composables/useAuth'
import { PhCheckCircle, PhXCircle, PhArrowsClockwise } from '@phosphor-icons/vue'

const { state, hasRole, hasPermission, hasAnyPermission, hasAllPermissions, setUserRoles, invalidateCache } = useRBAC()
const { login } = useAuth()

function switchRole(role: PlaygroundRole) {
  login(role)
  setUserRoles(role)
}

const checks = [
  { label: 'hasRole("admin")', fn: () => hasRole('admin') },
  { label: 'hasRole("editor")', fn: () => hasRole('editor') },
  { label: 'hasRole("viewer")', fn: () => hasRole('viewer') },
  { label: 'hasPermission("create:posts")', fn: () => hasPermission('create:posts') },
  { label: 'hasPermission("delete:posts")', fn: () => hasPermission('delete:posts') },
  { label: 'hasPermission("update:posts")', fn: () => hasPermission('update:posts') },
  { label: 'hasPermission("read:posts")', fn: () => hasPermission('read:posts') },
  { label: 'hasAnyPermission(["create:posts", "update:posts"])', fn: () => hasAnyPermission(['create:posts', 'update:posts']) },
  { label: 'hasAllPermissions(["create:posts", "delete:posts"])', fn: () => hasAllPermissions(['create:posts', 'delete:posts']) },
]

const roles: PlaygroundRole[] = ['admin', 'editor', 'viewer']

const roleColors: Record<string, string> = {
  admin: 'bg-cyan-600 text-white',
  editor: 'bg-violet-600 text-white',
  viewer: 'bg-slate-600 text-white',
}
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">useRBAC Composable</h2>
      <p class="text-gray-500 mt-1">Live reactive state and all available methods.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Reactive State -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 class="font-semibold text-gray-800 mb-4">Reactive State</h3>
        <div class="space-y-3 font-mono text-sm">
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-gray-500">state.isInitialized</span>
            <span :class="state.isInitialized ? 'text-emerald-600' : 'text-red-500'">{{ state.isInitialized }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-gray-500">state.isLoading</span>
            <span :class="state.isLoading ? 'text-amber-600' : 'text-gray-400'">{{ state.isLoading }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-50">
            <span class="text-gray-500">state.userRoles</span>
            <span class="text-cyan-700">{{ JSON.stringify(state.userRoles) }}</span>
          </div>
          <div class="pt-2">
            <span class="text-gray-500 block mb-2">state.roles (keys)</span>
            <pre class="text-xs bg-gray-50 rounded-xl p-3 text-gray-600 overflow-x-auto">{{ JSON.stringify(Object.keys(state.roles), null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Role Switcher + invalidateCache -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 class="font-semibold text-gray-800 mb-1">setUserRoles()</h3>
        <p class="text-sm text-gray-500 mb-4">Switch role to see all checks update reactively.</p>
        <div class="flex gap-3 flex-wrap">
          <button
            v-for="role in roles"
            :key="role"
            @click="switchRole(role)"
            :class="[
              'px-5 py-2.5 rounded-xl text-sm font-medium transition-all',
              state.userRoles.includes(role)
                ? roleColors[role]
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ]"
          >
            {{ role }}
          </button>
        </div>

        <div class="mt-6">
          <h3 class="font-semibold text-gray-800 mb-1">invalidateCache()</h3>
          <p class="text-sm text-gray-500 mb-3">Forces re-fetch on next access (dynamic/hybrid modes).</p>
          <button
            @click="invalidateCache()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
          >
            <PhArrowsClockwise :size="15" weight="bold" />
            Invalidate Cache
          </button>
        </div>
      </div>

      <!-- Permission Checks -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm lg:col-span-2">
        <h3 class="font-semibold text-gray-800 mb-4">Permission Checks</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div
            v-for="check in checks"
            :key="check.label"
            class="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50"
          >
            <code class="text-xs text-gray-600 font-mono">{{ check.label }}</code>
            <span :class="['flex items-center gap-1 text-sm font-semibold ml-3 shrink-0', check.fn() ? 'text-emerald-600' : 'text-red-400']">
              <PhCheckCircle v-if="check.fn()" :size="15" weight="fill" />
              <PhXCircle v-else :size="15" weight="fill" />
              {{ check.fn() ? 'true' : 'false' }}
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
