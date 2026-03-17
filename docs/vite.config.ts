import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import path from "node:path";
import { defineConfig } from "vite";

import { rehypeExternalMdLinksToTargetBlank } from "./src//utils/rehypeExternalMdLinksToTargetBlank";
import { env } from "./src/env";

export default defineConfig({
  root: __dirname,
  server: {
    port: env.DOCS_PORT,
  },
  resolve: {
    // tsconfigPaths fails on `@/` in MDX and few other files
    alias: {
      "@/e2e/": path.resolve(__dirname, "e2e") + "/",
      "@/": path.resolve(__dirname, "src") + "/",
    },
  },
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [rehypeSlug, rehypeExternalMdLinksToTargetBlank],
    }),
    reactRouter(),
  ],
});
