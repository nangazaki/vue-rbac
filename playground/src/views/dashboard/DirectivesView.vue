<script lang="ts" setup>
import { useRBAC } from '@nangazaki/vue-rbac'
import { PhCheckCircle, PhXCircle, PhLockKey } from '@phosphor-icons/vue'

const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions } = useRBAC()

const demos = [
  {
    directive: 'v-rbac',
    description: 'Show if user has a specific permission',
    code: `<div v-rbac="'create:posts'">...</div>`,
    check: () => hasPermission('create:posts'),
    label: 'create:posts',
  },
  {
    directive: 'v-rbac:role',
    description: 'Show if user has a specific role',
    code: `<div v-rbac:role="'admin'">...</div>`,
    check: () => hasRole('admin'),
    label: 'role = admin',
  },
  {
    directive: 'v-rbac:any',
    description: 'Show if user has at least one of the permissions',
    code: `<div v-rbac:any="['delete:posts', 'update:posts']">...</div>`,
    check: () => hasAnyPermission(['delete:posts', 'update:posts']),
    label: 'delete:posts OR update:posts',
  },
  {
    directive: 'v-rbac:all',
    description: 'Show only if user has ALL permissions',
    code: `<div v-rbac:all="['create:posts', 'delete:posts']">...</div>`,
    check: () => hasAllPermissions(['create:posts', 'delete:posts']),
    label: 'create:posts AND delete:posts',
  },
  {
    directive: 'v-rbac:not',
    description: 'Show if user does NOT have the permission',
    code: `<div v-rbac:not="'delete:posts'">...</div>`,
    check: () => !hasPermission('delete:posts'),
    label: 'NOT delete:posts',
  },
]
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">Directives</h2>
      <p class="text-gray-500 mt-1">All available RBAC directives with live evaluation for your current role.</p>
    </div>

    <div class="grid gap-4">
      <div
        v-for="demo in demos"
        :key="demo.directive"
        class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <code class="text-sm font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">{{ demo.directive }}</code>
              <span class="text-xs text-gray-400">{{ demo.label }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-4">{{ demo.description }}</p>
            <pre class="text-xs bg-gray-50 rounded-xl p-3 text-gray-700 font-mono overflow-x-auto">{{ demo.code }}</pre>
          </div>

          <div
            :class="[
              'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium',
              demo.check() ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
            ]"
          >
            <PhCheckCircle v-if="demo.check()" :size="16" weight="fill" />
            <PhXCircle v-else :size="16" weight="fill" />
            {{ demo.check() ? 'Visible' : 'Hidden' }}
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-50">
          <p class="text-xs text-gray-400 mb-2">Live output:</p>

          <template v-if="demo.directive === 'v-rbac'">
            <div v-rbac="'create:posts'" class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              <PhCheckCircle :size="15" weight="fill" />
              You have <code class="font-mono">create:posts</code>
            </div>
          </template>
          <template v-else-if="demo.directive === 'v-rbac:role'">
            <div v-rbac:role="'admin'" class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              <PhCheckCircle :size="15" weight="fill" />
              You are <code class="font-mono">admin</code>
            </div>
          </template>
          <template v-else-if="demo.directive === 'v-rbac:any'">
            <div v-rbac:any="['delete:posts', 'update:posts']" class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              <PhCheckCircle :size="15" weight="fill" />
              You have <code class="font-mono">delete:posts</code> or <code class="font-mono">update:posts</code>
            </div>
          </template>
          <template v-else-if="demo.directive === 'v-rbac:all'">
            <div v-rbac:all="['create:posts', 'delete:posts']" class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              <PhCheckCircle :size="15" weight="fill" />
              You have both <code class="font-mono">create:posts</code> and <code class="font-mono">delete:posts</code>
            </div>
          </template>
          <template v-else-if="demo.directive === 'v-rbac:not'">
            <div v-rbac:not="'delete:posts'" class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              <PhCheckCircle :size="15" weight="fill" />
              You don't have <code class="font-mono">delete:posts</code>
            </div>
          </template>

          <div v-if="!demo.check()" class="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-sm">
            <PhLockKey :size="15" weight="fill" />
            Element removed from DOM
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
