import { Button, Icon } from "@chakra-ui/react";
import { FiRefreshCw } from "react-icons/fi";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { mutateAndRefetchMountedQueries } from "@/graphql/mutateAndRefetchMountedQueries";
import { toast } from "@/utils/toast";
import { useIsLoading } from "@/utils/useIsLoading";

export function PostReimportButton(props: { idExternal: string }) {
  const loading = useIsLoading();

  async function refreshPost() {
    await loading.track(async () => {
      const response = await mutateAndRefetchMountedQueries(PostImportRefreshMutation, {
        idExternal: Number(props.idExternal),
      });

      if (response.success) {
        toast.success(`Refetch started`);
      } else {
        toast.error(`Error: ${response.errorMessage}`);
      }
    });
  }

  return (
    <Button
      size="2xs"
      variant="subtle-ghost-v2"
      h="auto"
      gap="gap.sm"
      colorPalette="gray"
      onClick={refreshPost}
      loading={loading.isActive}
      loadingText="Refreshing"
      data-testid={ids.post.btn.importRefresh}
    >
      <Icon>
        <FiRefreshCw />
      </Icon>
      Refetch
    </Button>
  );
}
const PostImportRefreshMutation = graphql.persisted(
  "PostImportRefresh",
  graphql(`
    mutation PostImportRefresh($idExternal: Int!) {
      post_import_refresh(id_external: $idExternal)
    }
  `),
);
