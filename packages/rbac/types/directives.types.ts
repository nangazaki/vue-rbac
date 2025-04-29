import type { DirectiveBinding, VNode } from "vue";

export interface DirectiveElementData {
  parent: Node;
  nextSibling: Node | null;
}

export type DirectiveHookParams = {
  el: HTMLElement;
  binding: DirectiveBinding;
  vnode: VNode;
};
