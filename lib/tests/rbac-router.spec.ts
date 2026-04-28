import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRBAC, CONFIG_MODE } from '../index'
import { useRBACRouter } from '../utils/rbac-router'
import type { RBAC } from '../types'

function createMockRouter() {
  let guard: ((to: any) => any) | undefined

  return {
    beforeEach: vi.fn((fn: (to: any) => any) => { guard = fn }),
    navigate: (meta: Record<string, unknown> = {}, fullPath = '/test') =>
      guard?.({ meta, fullPath }),
  }
}

const mockStorage = { get: () => null, set: () => {}, remove: () => {} }

describe('useRBACRouter', () => {
  let rbac: RBAC
  let router: ReturnType<typeof createMockRouter>

  beforeEach(async () => {
    rbac = createRBAC({
      mode: CONFIG_MODE.STATIC,
      storage: mockStorage,
      roles: {
        admin: { permissions: ['users:*', 'posts:delete'], inherits: ['editor'] },
        editor: { permissions: ['posts:create', 'posts:edit'], inherits: ['viewer'] },
        viewer: { permissions: ['posts:view'] },
      },
    })
    await rbac.init()
    router = createMockRouter()
  })

  it('registers a beforeEach guard on the router', () => {
    useRBACRouter(router, rbac)
    expect(router.beforeEach).toHaveBeenCalledOnce()
  })

  it('allows navigation when route has no rbac meta', () => {
    useRBACRouter(router, rbac)
    expect(router.navigate({})).toBeUndefined()
    expect(router.navigate({ otherMeta: true })).toBeUndefined()
  })

  describe('permission', () => {
    it('allows when user has required permission', () => {
      rbac.setUserRoles(['editor'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { permission: 'posts:create' } })).toBeUndefined()
    })

    it('redirects when user lacks required permission', () => {
      rbac.setUserRoles(['viewer'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { permission: 'posts:create' } })).toBe('/unauthorized')
    })

    it('allows when user has all permissions in array (AND)', () => {
      rbac.setUserRoles(['editor'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { permission: ['posts:create', 'posts:edit'] } })).toBeUndefined()
    })

    it('redirects when user is missing one permission in array', () => {
      rbac.setUserRoles(['editor'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { permission: ['posts:create', 'posts:delete'] } })).toBe('/unauthorized')
    })
  })

  describe('role', () => {
    it('allows when user has required role', () => {
      rbac.setUserRoles(['admin'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { role: 'admin' } })).toBeUndefined()
    })

    it('redirects when user lacks required role', () => {
      rbac.setUserRoles(['viewer'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { role: 'admin' } })).toBe('/unauthorized')
    })

    it('allows when user has any role in array (OR)', () => {
      rbac.setUserRoles(['editor'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { role: ['admin', 'editor'] } })).toBeUndefined()
    })
  })

  describe('any', () => {
    it('allows when user has at least one permission', () => {
      rbac.setUserRoles(['viewer'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { any: ['posts:view', 'posts:create'] } })).toBeUndefined()
    })

    it('redirects when user has none of the permissions', () => {
      rbac.setUserRoles(['viewer'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { any: ['posts:create', 'posts:delete'] } })).toBe('/unauthorized')
    })
  })

  describe('all', () => {
    it('allows when user has all permissions', () => {
      rbac.setUserRoles(['editor'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { all: ['posts:create', 'posts:edit'] } })).toBeUndefined()
    })

    it('redirects when user is missing one permission', () => {
      rbac.setUserRoles(['editor'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { all: ['posts:create', 'posts:delete'] } })).toBe('/unauthorized')
    })
  })

  describe('not', () => {
    it('allows when user does not have the permission', () => {
      rbac.setUserRoles(['viewer'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { not: 'posts:delete' } })).toBeUndefined()
    })

    it('redirects when user has the permission', () => {
      rbac.setUserRoles(['admin'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { not: 'posts:delete' } })).toBe('/unauthorized')
    })
  })

  describe('wildcard permissions', () => {
    it('allows via wildcard when route requires specific resource action', () => {
      rbac.setUserRoles(['admin'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { permission: 'users:create' } })).toBeUndefined()
      expect(router.navigate({ rbac: { permission: 'users:delete' } })).toBeUndefined()
    })

    it('works with resource-scoped permissions (entries:view:section-123)', async () => {
      const rbacScoped = createRBAC({
        mode: CONFIG_MODE.STATIC,
        storage: mockStorage,
        roles: { manager: { permissions: ['entries:*'] } },
      })
      await rbacScoped.init()
      rbacScoped.setUserRoles(['manager'])
      const r = createMockRouter()
      useRBACRouter(r, rbacScoped)
      expect(r.navigate({ rbac: { permission: 'entries:view' } })).toBeUndefined()
    })
  })

  describe('onUnauthorized', () => {
    it('defaults to /unauthorized when no callback provided', () => {
      rbac.setUserRoles(['viewer'])
      useRBACRouter(router, rbac)
      expect(router.navigate({ rbac: { permission: 'posts:delete' } })).toBe('/unauthorized')
    })

    it('uses custom callback when provided', () => {
      rbac.setUserRoles(['viewer'])
      useRBACRouter(router, rbac, {
        onUnauthorized: (to) => ({ name: 'unauthorized', query: { from: to.fullPath } }),
      })
      const result = router.navigate({ rbac: { permission: 'posts:delete' } }, '/secret')
      expect(result).toEqual({ name: 'unauthorized', query: { from: '/secret' } })
    })
  })
})
