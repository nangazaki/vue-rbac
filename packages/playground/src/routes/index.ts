import LoginView from "@/views/login/LoginView.vue"
import { createRouter, createWebHistory } from "vue-router"

const routes = [
  { path: '/login', component: LoginView }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})