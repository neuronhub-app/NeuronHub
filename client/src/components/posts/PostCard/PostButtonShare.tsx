import { Icon, IconButton } from "@chakra-ui/react";
import { useEffect } from "react";
import { FaShare } from "react-icons/fa6";
import { useSnapshot } from "valtio/react";
import { user } from "@/apps/users/useUserCurrent";
import { Tooltip } from "@/components/ui/tooltip";
import type { ID } from "@/gql-tada";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import type { UserListName } from "~/graphql/enums";

// todo feat(UI): clipboard action on click
// todo feat(UI): mutate Post.recommended_to_users/groups
export function PostButtonShare(props: {
  id: ID;
  fieldName: typeof UserListName.Library | typeof UserListName.ReadLater;
}) {
  const userSnap = useSnapshot(user.state);

  const state = useValtioProxyRef({
    isLoading: false,
    isAdded: false,
  });

  const userLibrary = userSnap.current?.[props.fieldName];

  useEffect(() => {
    if (!userSnap.current) {
      return;
    }
    const isInList = userLibrary?.some((post: { pk: ID }) => post.pk === props.id);
    state.mutable.isAdded = isInList ?? false;
  }, [userLibrary, props.id]);

  return (
    <Tooltip content="Share" positioning={{ placement: "left" }}>
      <IconButton
        loading={state.snap.isLoading}
        onClick={async () => {}}
        variant="subtle-ghost"
        size="sm"
        aria-label="Share"
      >
        <Icon boxSize={3.5}>
          <FaShare />
        </Icon>
      </IconButton>
    </Tooltip>
  );
}
