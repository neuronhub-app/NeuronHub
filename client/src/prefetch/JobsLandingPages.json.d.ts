/**
 * #AI-slop
 *
 * Shim so tsgo doesn't fail on fresh checkouts with the missing JSON.
 *
 * Runtime [[react-router.config.ts]] creates the missing file.
 */
declare module "~/graphql/prefetch/JobsLandingPages.json" {
  const data: import("@/prefetch/JobsLandingPage").JobsLandingPagesData;
  export default data;
}
