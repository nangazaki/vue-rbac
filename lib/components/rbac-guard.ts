import { defineComponent, h, type PropType } from "vue";
import { useRBAC } from "../composables/index";
import { logger } from "../utils/logger";

const ACCESS_PROPS = ["role", "permission", "any", "all", "not"] as const;
type AccessProp = (typeof ACCESS_PROPS)[number];

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

    /**
     * Denies access when the user has the specified role OR permission.
     * Accepts a string or array of strings. Each value is checked against
     * both roles and permissions — access is blocked if any match is found.
     */
    not: {
      type: [String, Array] as PropType<string | string[]>,
      default: undefined,
    },
  },

  setup(props, { slots }) {
    const rbac = useRBAC();

    function warnMultipleProps(): void {
      const active = ACCESS_PROPS.filter(
        (p) => props[p as AccessProp] !== undefined
      );
      if (active.length > 1) {
        logger.warn(
          `[RbacGuard] Multiple access props detected: [${active.join(", ")}]. ` +
            `Only "${active[0]}" will be evaluated. Use a single prop per guard.`
        );
      }
    }

    function isAllowed(): boolean {
      warnMultipleProps();

      if (props.role !== undefined) {
        return toArray(props.role).some((r) => rbac.hasRole(r));
      }

      if (props.permission !== undefined) {
        return toArray(props.permission).every((p) => rbac.hasPermission(p));
      }

      if (props.any !== undefined) {
        return rbac.hasAnyPermission(toArray(props.any));
      }

      if (props.all !== undefined) {
        return rbac.hasAllPermissions(toArray(props.all));
      }

      if (props.not !== undefined) {
        return !toArray(props.not).some(
          (v) => rbac.hasRole(v) || rbac.hasPermission(v)
        );
      }

      return false;
    }

    return () => {
      if (rbac.state.isLoading) {
        return slots.loading?.() ?? null;
      }

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
