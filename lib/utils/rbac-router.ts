import type { RBAC } from '../types'

export interface RBACRouteMeta {
  permission?: string | string[]
  role?: string | string[]
  any?: string[]
  all?: string[]
  not?: string | string[]
}

interface RouteLocation {
  fullPath: string
  meta: Record<string, unknown>
}

type RedirectTarget = string | Record<string, unknown>

export interface RBACRouterOptions {
  onUnauthorized?: (to: RouteLocation) => RedirectTarget
}

interface Router {
  beforeEach(guard: (to: RouteLocation) => RedirectTarget | void): void
}

export function useRBACRouter(
  router: Router,
  rbac: RBAC,
  options: RBACRouterOptions = {},
): void {
  const redirect = options.onUnauthorized ?? (() => '/unauthorized')

  router.beforeEach((to) => {
    const meta = to.meta?.rbac as RBACRouteMeta | undefined
    if (!meta) return
    if (!checkRouteMeta(meta, rbac)) return redirect(to)
  })
}

function checkRouteMeta(meta: RBACRouteMeta, rbac: RBAC): boolean {
  if (meta.permission !== undefined) {
    const perms = Array.isArray(meta.permission) ? meta.permission : [meta.permission]
    return rbac.hasAllPermissions(perms)
  }
  if (meta.role !== undefined) {
    const roles = Array.isArray(meta.role) ? meta.role : [meta.role]
    return roles.some((r) => rbac.hasRole(r))
  }
  if (meta.any !== undefined) return rbac.hasAnyPermission(meta.any)
  if (meta.all !== undefined) return rbac.hasAllPermissions(meta.all)
  if (meta.not !== undefined) {
    const perms = Array.isArray(meta.not) ? meta.not : [meta.not]
    return !rbac.hasAnyPermission(perms)
  }
  return true
}
