import type { DirectiveBinding, VNode } from "vue";
import { RBAC } from "./types/index";

export function createRBACDirective(rbac: RBAC) {
  const originalElements = new WeakMap();

  return {
    beforeMount(el: HTMLElement, binding: DirectiveBinding, vnode: VNode) {
      const hasAccess = checkAccess(binding, rbac);
      if (!hasAccess) {
        const parent = el.parentNode;
        if (parent) {
          originalElements.set(el, {
            parent,
            nextSibling: el.nextSibling,
          });

          parent.removeChild(el);
        }
      }
    },

    updated(el: HTMLElement, binding: DirectiveBinding) {
      const hasAccess = checkAccess(binding, rbac);
      const originalData = originalElements.get(el);

      if (!hasAccess && el.parentNode) {
        const parent = el.parentNode;
        originalElements.set(el, {
          parent,
          nextSibling: el.nextSibling,
        });
        parent.removeChild(el);
      } else if (hasAccess && originalData && !el.parentNode) {
        const { parent, nextSibling } = originalData;
        if (nextSibling) {
          parent.insertBefore(el, nextSibling);
        } else {
          parent.appendChild(el);
        }
        originalElements.delete(el);
      }
    },

    unmounted(el: HTMLElement) {
      originalElements.delete(el);
    },
  };
}

function checkAccess(binding: DirectiveBinding, rbac: RBAC): boolean {
  const modifier = Object.keys(binding.modifiers)[0] || "permission";
  const value = binding.value;
  let hasAccess = false;

  switch (modifier) {
    case "role":
      // v-rbac:role="'admin'"
      hasAccess = typeof value === "string" ? rbac.hasRole(value) : false;
      break;

    case "any":
      // v-rbac:any="['users:create', 'users:edit']"
      if (Array.isArray(value)) {
        hasAccess = rbac.hasAnyPermission(value);
      } else if (typeof value === "string") {
        hasAccess = rbac.hasPermission(value);
      } else {
        hasAccess = false;
      }
      break;

    case "all":
      // v-rbac:all="['users:create', 'users:edit']"
      if (Array.isArray(value)) {
        hasAccess = rbac.hasAllPermissions(value);
      } else if (typeof value === "string") {
        hasAccess = rbac.hasPermission(value);
      } else {
        hasAccess = false;
      }
      break;

    case "not":
      // v-rbac:not="'users:delete'"
      if (typeof value === "string") {
        hasAccess = !rbac.hasPermission(value);
      } else if (Array.isArray(value)) {
        hasAccess = !rbac.hasAnyPermission(value);
      } else {
        hasAccess = false;
      }
      break;

    case "permission":
    default:
      // v-rbac="'users:create'"
      if (typeof value === "string") {
        hasAccess = rbac.hasPermission(value);
      } else if (Array.isArray(value)) {
        hasAccess = rbac.hasAllPermissions(value);
      } else {
        hasAccess = false;
      }
      break;
  }

  return hasAccess;
}
