import { Icon, Popover, Portal } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { graphql, type ID } from "@/gql-tada";
import { mutateDeleteAndRefetchQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/routes";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function PostReviewDeleteButton(props: { id: ID; toolTitle: string }) {
  const navigate = useNavigate();

  const state = useValtioProxyRef({ isLoading: false });

  async function deleteReview() {
    state.mutable.isLoading = true;
    const response = await mutateDeleteAndRefetchQueries(
      graphql(`mutation ReviewDelete($id: ID!) { post_delete(data: { id: $id }) { id } }`),
      { id: props.id },
    );
    state.mutable.isLoading = false;
    if (response.success) {
      toast.success(`Review for "${props.toolTitle}" deleted`);
      await navigate(urls.reviews.list);
    } else {
      toast.error(`Error from server: ${response.error}`);
    }
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          colorPalette="red"
          size="lg"
          loadingText="Delete"
          spinnerPlacement="start"
          loading={state.snap.isLoading}
        >
          <Icon opacity={0.75}>
            <FiTrash2 />
          </Icon>
          Delete
        </Button>
      </Popover.Trigger>

      <Portal>
        <Popover.Positioner>
          <Popover.Content w="fit-content">
            <Popover.Arrow />
            <Popover.Body>Are you sure?</Popover.Body>
            <Popover.Footer justifyContent="flex-end" gap="gap.md">
              <Button variant="outline">Cancel</Button>
              <Button colorPalette="red" onClick={deleteReview} loading={state.snap.isLoading}>
                Delete
              </Button>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
