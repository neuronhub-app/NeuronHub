import { user } from "@/apps/users/useUserCurrent";
import { Tooltip } from "@/components/ui/tooltip";
import type { ID } from "@/gql-tada";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { Icon, IconButton } from "@chakra-ui/react";
import { useEffect } from "react";
import { FaShare } from "react-icons/fa6";
import { useSnapshot } from "valtio/react";
import type { ListFieldName } from "~/graphql/graphql";

export function PostButtonShare(props: { id: ID; fieldName: ListFieldName }) {
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
    const isInList = userLibrary?.some((review: { pk: ID }) => review.pk === props.id);
    state.mutable.isAdded = isInList ?? false;
  }, [userLibrary]);

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
