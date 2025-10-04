import type { DirectiveBinding, VNode } from "vue";
import type { DirectiveElementData } from "./types/directives.types";
import { RBAC } from "./types/index";
import { checkAccess } from "./utils/access-check";

export function createRBACDirective(rbac: RBAC) {
  const originalElements = new WeakMap<HTMLElement, DirectiveElementData>();

  return {
    beforeMount(el: HTMLElement, binding: DirectiveBinding, _vnode: VNode) {
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
      const data = originalElements.get(el);

      if (!hasAccess && el.parentNode) {
        const _parent = el.parentNode;
        originalElements.set(el, {
          parent: el.parentNode,
          nextSibling: el.nextSibling,
        });
        el.parentNode.removeChild(el);
      } else if (hasAccess && data && !el.isConnected) {
        const { parent, nextSibling } = data;
        if (nextSibling && nextSibling.parentNode === parent) {
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
