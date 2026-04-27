import { ref, computed } from 'vue'

export type PlaygroundRole = 'admin' | 'editor' | 'viewer'

const currentRole = ref<PlaygroundRole | null>(
  sessionStorage.getItem('playground-role') as PlaygroundRole | null
)

export function useAuth() {
  const isLoggedIn = computed(() => currentRole.value !== null)

  function login(role: PlaygroundRole) {
    currentRole.value = role
    sessionStorage.setItem('playground-role', role)
  }

  function logout() {
    currentRole.value = null
    sessionStorage.removeItem('playground-role')
  }

  return { currentRole, isLoggedIn, login, logout }
}
