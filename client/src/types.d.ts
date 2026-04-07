/// <reference types="vite/client" />

interface Window {
  dataLayer?: Record<string, unknown>[];
}

declare module "valtio/react" {
  /**
   * Because valtio.useSnapshot returns a deep `readonly`, creating TS errors for third-party packages.
   *
   * See: https://github.com/pmndrs/valtio/issues/327
   */
  function useSnapshot<T extends object>(p: T): T;
}
