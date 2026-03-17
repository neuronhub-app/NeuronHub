import { env } from "./src/env";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import path from "node:path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: __dirname,
  server: {
    port: env.DOCS_PORT_E2E,
  },
  resolve: {
    // tsconfigPaths fails on `@/` in MDX
    alias: { "@/": path.resolve(__dirname, "src") + "/" },
  },
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      rehypePlugins: [rehypeSlug],
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
});
