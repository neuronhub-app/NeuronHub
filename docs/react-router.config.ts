import type { Config } from "@react-router/dev/config";

import { getPageSlugByFilepath, pagesDir } from "./src/getPageSlugByFilepath";
import { findMdxFiles } from "./src/utils/findMdxFiles";

export default {
  ssr: false,
  appDirectory: "src",
  // #AI #197:
  // ssr:false ⇒ dir-redirect routes (with `clientLoader`) can't prerender; we prerender only the
  // real mdx pages and let the SPA fallback (`/*`→`/__spa-fallback.html`) resolve redirects at runtime.
  prerender: () => ["/", ...findMdxFiles(pagesDir).map(getPageSlugByFilepath)],
} satisfies Config;
