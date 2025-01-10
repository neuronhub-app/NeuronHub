declare module "valtio/react" {
  // default returns deep readonly, which creates too many problems for TS compiler in third-party packages
  // https://github.com/pmndrs/valtio/issues/327
  function useSnapshot<T extends object>(p: T): T;
}
