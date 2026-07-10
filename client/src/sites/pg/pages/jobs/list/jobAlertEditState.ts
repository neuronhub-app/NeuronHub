/**
 * Which alert is being edited, seeded once from the `?edit_alert=` URL param by [[JobList.tsx]].
 *
 * Why not read the param directly: Algolia's default history router rebuilds the querystring from
 * only its own state, so it strips `edit_alert` the moment [[JobAlertEditController]] reverse-applies
 * the filters.
 *
 * Own module (not [[JobAlertEditController]]) so [[PgFacetPopover]] can read edit mode without a
 * circular import (the controller pulls in facet components).
 */
import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";

const editState = proxy({ idExt: undefined as string | undefined });

export function seedJobAlertEdit(idExt: string | undefined) {
  editState.idExt = idExt;
}

export function useJobAlertEditIdExt(): string | undefined {
  return useSnapshot(editState).idExt;
}
