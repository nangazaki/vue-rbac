import { DirectiveBinding } from "vue";

type RBACModifier = "role" | "any" | "all" | "not" | "permission";

type RBACValue = string | string[];

// Typing of v-rbac directive
declare module "vue" {
  interface directives {
    rbac: {
      beforeMount(
        el: HTMLElement,
        binding: DirectiveBinding,
        vnode: VNode
      ): void;
      updated(el: HTMLElement, binding: DirectiveBinding): void;
      unmounted(el: HTMLElement): void;
    };
  }
}

// Typing of possible options for the directive
declare module "@nangazaki/vue-rbac" {
  export type RBACModifiers = RBACModifier;
  export type RBACValues = RBACValue;
}
