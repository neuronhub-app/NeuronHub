/**
 * #AI
 */

/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { frontmatter } from "@/components/frontmatter";

  export const frontmatter: frontmatter.SchemaType;
  export default ComponentType;
}

declare module "valtio/react" {
  /**
   * Because valtio.useSnapshot returns a deep `readonly`, creating TS errors for third-party packages.
   *
   * See: https://github.com/pmndrs/valtio/issues/327
   */
  function useSnapshot<T extends object>(p: T): T;
}
