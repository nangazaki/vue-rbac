<script lang="ts" setup>
import { RbacGuard } from '@nangazaki/vue-rbac'
import { PhPencilSimple, PhShieldCheck, PhLockKey, PhEye, PhWarning, PhNote } from '@phosphor-icons/vue'
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900">RbacGuard Component</h2>
      <p class="text-gray-500 mt-1">Component-based access control with fallback and loading slots.</p>
    </div>

    <div class="grid gap-4">

      <!-- permission prop -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <code class="text-sm font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">permission</code>
        <p class="text-sm text-gray-500 mt-2 mb-4">Renders default slot only if user has the permission.</p>
        <pre class="text-xs bg-gray-50 rounded-xl p-3 text-gray-700 font-mono mb-4 overflow-x-auto">&lt;RbacGuard permission="create:posts"&gt;
  &lt;button&gt;Create Post&lt;/button&gt;
  &lt;template #fallback&gt;No access&lt;/template&gt;
&lt;/RbacGuard&gt;</pre>
        <div class="pt-4 border-t border-gray-50">
          <p class="text-xs text-gray-400 mb-2">Live output:</p>
          <RbacGuard permission="create:posts">
            <button class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium">
              <PhNote :size="15" weight="fill" /> Create Post
            </button>
            <template #fallback>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm">
                <PhLockKey :size="15" weight="fill" /> No access — requires create:posts
              </span>
            </template>
          </RbacGuard>
        </div>
      </div>

      <!-- role prop -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <code class="text-sm font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">role</code>
        <p class="text-sm text-gray-500 mt-2 mb-4">Renders default slot only if user has the specified role.</p>
        <pre class="text-xs bg-gray-50 rounded-xl p-3 text-gray-700 font-mono mb-4 overflow-x-auto">&lt;RbacGuard role="admin"&gt;
  &lt;div&gt;Admin Panel&lt;/div&gt;
  &lt;template #fallback&gt;Admins only&lt;/template&gt;
&lt;/RbacGuard&gt;</pre>
        <div class="pt-4 border-t border-gray-50">
          <p class="text-xs text-gray-400 mb-2">Live output:</p>
          <RbacGuard role="admin">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-800 rounded-lg text-sm font-medium">
              <PhShieldCheck :size="15" weight="fill" /> Admin Panel
            </div>
            <template #fallback>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm">
                <PhLockKey :size="15" weight="fill" /> Admins only
              </span>
            </template>
          </RbacGuard>
        </div>
      </div>

      <!-- any prop -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <code class="text-sm font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">any</code>
        <p class="text-sm text-gray-500 mt-2 mb-4">Renders if user has at least one of the permissions (OR).</p>
        <pre class="text-xs bg-gray-50 rounded-xl p-3 text-gray-700 font-mono mb-4 overflow-x-auto">&lt;RbacGuard :any="['update:posts', 'create:posts']"&gt;
  &lt;div&gt;Post Management&lt;/div&gt;
  &lt;template #fallback&gt;No access&lt;/template&gt;
&lt;/RbacGuard&gt;</pre>
        <div class="pt-4 border-t border-gray-50">
          <p class="text-xs text-gray-400 mb-2">Live output:</p>
          <RbacGuard :any="['update:posts', 'create:posts']">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
              <PhPencilSimple :size="15" weight="fill" /> Post Management
            </div>
            <template #fallback>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-lg text-sm">
                <PhLockKey :size="15" weight="fill" /> Requires update:posts or create:posts
              </span>
            </template>
          </RbacGuard>
        </div>
      </div>

      <!-- not prop -->
      <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <code class="text-sm font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">not</code>
        <p class="text-sm text-gray-500 mt-2 mb-4">Renders if user does NOT have the role or permission.</p>
        <pre class="text-xs bg-gray-50 rounded-xl p-3 text-gray-700 font-mono mb-4 overflow-x-auto">&lt;RbacGuard not="delete:posts"&gt;
  &lt;div&gt;Safe for non-admins&lt;/div&gt;
  &lt;template #fallback&gt;Hidden for admins&lt;/template&gt;
&lt;/RbacGuard&gt;</pre>
        <div class="pt-4 border-t border-gray-50">
          <p class="text-xs text-gray-400 mb-2">Live output:</p>
          <RbacGuard not="delete:posts">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium">
              <PhEye :size="15" weight="fill" /> Visible to non-admins
            </div>
            <template #fallback>
              <span class="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm">
                <PhWarning :size="15" weight="fill" /> Hidden for users with delete:posts
              </span>
            </template>
          </RbacGuard>
        </div>
      </div>

    </div>
  </div>
</template>
