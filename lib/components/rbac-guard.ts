import { defineComponent, h, type PropType } from "vue";
import { useRBAC } from "../composables/index";

export const RbacGuard = defineComponent({
  name: "RbacGuard",

  props: {
    role: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },

    permission: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },

    any: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },

    all: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },

    not: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },
  },

  setup(props, { slots }) {
    const rbac = useRBAC();

    function isAllowed(): boolean {
      if (props.role !== undefined) {
        const roles = toArray(props.role);
        return roles.some((r) => rbac.hasRole(r));
      }

      if (props.permission !== undefined) {
        const permissions = toArray(props.permission);
        return permissions.every((p) => rbac.hasPermission(p));
      }

      if (props.any !== undefined) {
        return rbac.hasAnyPermission(toArray(props.any));
      }

      if (props.all !== undefined) {
        return rbac.hasAllPermissions(toArray(props.all));
      }

      if (props.not !== undefined) {
        const values = toArray(props.not);
        return !values.some((v) => rbac.hasRole(v) || rbac.hasPermission(v));
      }

      return false;
    }

    return () => {
      if (isAllowed()) {
        return slots.default?.();
      }

      return slots.fallback?.() ?? null;
    };
  },
});

function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
