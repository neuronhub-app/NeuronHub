import { useSnapshot } from "valtio/react";
import { proxy, subscribe } from "valtio/vanilla";

/**
 * A primitive wrapper to indicate the real Proxy type.
 * Otherwise Valtio lies that T is just a plain object.
 */
export class ValtioProxy<T extends object> {
  private readonly proxyObject: T;

  constructor(initialState: T) {
    this.proxyObject = proxy(initialState);
  }

  get value(): T {
    return this.proxyObject;
  }

  useSnapshot() {
    return {
      value: useSnapshot(this.proxyObject),
    };
  }

  subscribe(callback: (state: T) => void) {
    return subscribe(this.proxyObject, () => callback(this.proxyObject));
  }
}
