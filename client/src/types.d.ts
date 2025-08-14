declare module "valtio/react" {
  /**
   * because default returns deep `readonly`, creating TS errors for third-party packages
   * https://github.com/pmndrs/valtio/issues/327
   */
  function useSnapshot<T extends object>(p: T): T;
}
