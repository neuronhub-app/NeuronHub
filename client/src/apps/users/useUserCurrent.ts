/**
 * todo ! refac-name: useAuth.ts.
 */
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";
import { proxySet } from "valtio/utils";

import { User, UserConnection } from "@/apps/users/UserStateProvider";
import { type ID } from "@/gql-tada";

// todo ? refac-name: useUser.
export function useAuth() {
  const snap = useSnapshot(user.state);

  return {
    isLoggedIn: Boolean(snap.current?.id),
    userId: snap.current?.id,
    user: snap.current,
  };
}

// todo ? refac: Move out to user.ts & consolidate users ops in the namespace.
export namespace user {
  /**
   * @deprecated: for read-only use `useAuth` instead.
   *
   * todo ? refac: make private & export mutable ref in `useAuth`.
   */
  export const state = proxy({
    current: null as User | null,
    connections: [] as UserConnection[],
    postsCollapsed: [],
    followedImporterUserSourceIds: proxySet<ID>(),
  });
}

/**
 * @deprecated: use `useAuth` instead.
 */
export function useUser() {
  const snap = useSnapshot(user.state);

  return snap.current;
}
