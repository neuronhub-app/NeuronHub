/**
 * #AI
 */

export type TestId = string;

export namespace ids {
  export const sidebar = {
    root: "sidebar",
    logo: "sidebar.logo",
  } as const;

  export const toc = {
    root: "toc",
  } as const;

  export const imageZoom = {
    backdrop: "image-zoom.backdrop",
  } as const;

  export function selector<S extends TestId>(id: S): `[data-testid="${S}"]` {
    return `[data-testid="${id}"]`;
  }

  export function set<S extends TestId>(id?: S): { "data-testid": S } | ObjectEmpty {
    if (id === undefined) {
      return {};
    }
    return { "data-testid": id };
  }

  type ObjectEmpty = Record<keyof never, never>;
}
