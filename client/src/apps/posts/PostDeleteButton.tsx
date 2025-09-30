import { Icon, Popover, Portal } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { graphql, type ID } from "@/gql-tada";
import { mutateDeleteAndResetStore } from "@/graphql/mutateAndRefetchMountedQueries";
import { urls } from "@/routes";
import { useIsLoading } from "@/utils/useIsLoading";

export function PostDeleteButton(props: { id: ID; title: string }) {
  const navigate = useNavigate();

  const loading = useIsLoading();

  async function deletePost() {
    await loading.track(async () => {
      const response = await mutateDeleteAndResetStore(
        graphql(`mutation PostDelete($id: ID!) { post_delete(data: { id: $id }) { id } }`),
        { id: props.id },
      );
      if (response.success) {
        toast.success(`Post "${props.title.slice(0, 30)}..." deleted`);
        return navigate(urls.posts.list);
      } else {
        toast.error(`Error: ${response.errorMessage}`);
      }
    });
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
          loading={loading.isActive}
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
              <Button colorPalette="red" onClick={deletePost} loading={loading.isActive}>
                Delete
              </Button>
            </Popover.Footer>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
}
