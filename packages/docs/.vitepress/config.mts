import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vue RBAC",
  description: "A VitePress Site",
  lang: "en-US",
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    search: {
      provider: "local",
    },

    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/examples" },
    ],

    langMenuLabel: "true",

    sidebar: {
      "/": [
        {
          text: "Guide",
          collapsed: false,
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Configuration", link: "/guide/configuration" },
            { text: "API Reference", link: "/guide/api-reference" },
          ],
        },
        {
          text: "Examples",
          link: "/examples",
        },
        {
          text: "Why Vue RBAC?",
          link: "/why-vue-rbac",
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/nangazaki/vue-rbac" },
      { icon: "twitter", link: "https://twitter.com/heldercambuta" },
      { icon: "discord", link: "..." },
    ],

    docFooter: {
      prev: false,
      next: true,
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025",
    },
    // Mobile Config only
    returnToTopLabel: 'Go to Top',
    sidebarMenuLabel: 'Menu',
  },
  markdown: {
    theme: "tokyo-night",
    lineNumbers: true,
  },
});
