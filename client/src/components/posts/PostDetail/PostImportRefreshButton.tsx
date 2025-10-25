import { Button } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { FiRefreshCw } from "react-icons/fi";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { useIsLoading } from "@/utils/useIsLoading";

export function PostImportRefreshButton(props: { idExternal: string }) {
  const loading = useIsLoading();

  async function refreshPost() {
    await loading.track(async () => {
      const response = await mutateAndRefetchMountedQueries(
        graphql(`
          mutation PostImportRefresh($idExternal: String!) {
            post_import_refresh(id_external: $idExternal) {
              comments_added
            }
          }
        `),
        { idExternal: props.idExternal },
      );

      if (response.success) {
        await client.refetchQueries({ include: "all" });

        const commentsAdded = response.data.post_import_refresh.comments_added;
        if (commentsAdded > 0) {
          toast.success(`Added ${commentsAdded} new comment${commentsAdded !== 1 ? "s" : ""}`);
        }
      } else {
        toast.error(`Error: ${response.errorMessage}`);
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={refreshPost}
      loading={loading.isActive}
      loadingText="Refreshing"
      data-testid={ids.post.btn.importRefresh}
    >
      <FiRefreshCw />
      Refresh from source
    </Button>
  );
}
