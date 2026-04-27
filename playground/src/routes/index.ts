import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'
import DashboardLayout from '@/layout/Dashboard.vue'
import DirectivesView from '@/views/dashboard/DirectivesView.vue'
import GuardView from '@/views/dashboard/GuardView.vue'
import ComposableView from '@/views/dashboard/ComposableView.vue'

const routes = [
  { path: '/login', component: LoginView },
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: DirectivesView },
      { path: 'guard', component: GuardView },
      { path: 'composable', component: ComposableView },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const hasRole = sessionStorage.getItem('playground-role')
  if (to.meta.requiresAuth && !hasRole) return '/login'
})
