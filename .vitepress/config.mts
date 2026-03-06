import { defineConfig } from "vitepress";
import katex from "@iktakahiro/markdown-it-katex";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blogs/",
  head: [
    // Add KaTeX CSS (Updated to the full CDN path so it works!)
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css",
      },
    ],
  ],
  markdown: {
    config: (md) => {
      md.use(katex);
    },
  },
  srcDir: "docs",

  title: "[]'s blogs",
  description: "",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    outline: [1, 4],
    nav: [{ text: "Home", link: "/" }],

    sidebar: [
      {
        text: "Section 1",
        items: [
          { text: "Item 1", link: "." },
          { text: "Runtime API Examples", link: "/api-examples" },
        ],
      },
      {
        text: "More Stuff",
        items: [{ text: "Item 2", link: "." }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/In-Saiyan/insane-vitepress" },
      // { icon: 'linkedin', link: 'https://linkedin.com/in/aryansingh-dev' }, // FOLLOW?
      // { icon: 'instagram', link: 'https://instagram.com/_insaiyan__' } // FOLLOW?
    ],
  },
});
