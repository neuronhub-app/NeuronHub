import { Avatar, Flex, Popover, Portal, SkeletonText, Text } from "@chakra-ui/react";
import type { PostListItemType } from "@/components/posts/ListContainer";
import type { PostCommentTree } from "@/components/posts/PostDetail";
import { Prose } from "@/components/ui/prose";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { PostAuthorFragment, type PostAuthorFragmentType } from "@/graphql/fragments/posts";
import { datetime } from "@/utils/date-fns";
import { markedConfigured } from "@/utils/marked-configured";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";
import { useIsLoading } from "@/utils/useIsLoading";
import { useStateValtio } from "@/utils/useValtioProxyRef";

export function PostAuthor(props: {
  post: PostListItemType | PostCommentTree;
  isHideAvatar?: boolean;
}) {
  const loading = useIsLoading();

  const state = useStateValtio({
    post: null as null | PostAuthorFragmentType,
    isClicked: false,
  });

  const isImportedAuthor = Boolean(props.post.post_source?.id);

  useInit({
    isReady: isImportedAuthor && !state.snap.post && state.snap.isClicked,
    onInit: async () => {
      await loading.track(async () => {
        const res = await client.query({
          query: PostAuthorQuery,
          variables: { id: props.post.id },
        });
        if (res.data) {
          state.mutable.post = res.data.post_generic;
        } else {
          toast.error("Author loading failed");
        }
      });
    },
  });

  if (isImportedAuthor) {
    const author = state.snap.post?.post_source?.user_source;

    return (
      <Popover.Root
        lazyMount
        unmountOnExit
        onOpenChange={_ => {
          state.mutable.isClicked = true;
        }}
      >
        <Popover.Trigger>
          <PostAuthorUsername post={props.post} isPopover isHideAvatar={props.isHideAvatar} />
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Body gap="gap.sm" display="flex" flexDirection="column">
                {loading.isActive ? (
                  <>
                    <Flex>
                      <SkeletonText noOfLines={1} />
                    </Flex>
                    <Flex>
                      <SkeletonText noOfLines={1} />
                    </Flex>
                  </>
                ) : (
                  author && (
                    <>
                      <Flex>
                        <Text fontWeight="bold">Created</Text>:{" "}
                        {datetime.relative(author.created_at_external)}
                      </Flex>
                      <Flex>
                        <Text fontWeight="bold">Karma</Text>:{" "}
                        {new Intl.NumberFormat().format(author.score)}
                      </Flex>
                      {author.about && (
                        <Prose
                          size="xs"
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: imported
                          dangerouslySetInnerHTML={{
                            __html: markedConfigured.parse(author.about),
                          }}
                        />
                      )}
                    </>
                  )
                )}
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    );
  }
  return <PostAuthorUsername post={props.post} isHideAvatar={props.isHideAvatar} />;
}

const PostAuthorQuery = graphql.persisted(
  "PostAuthor",
  graphql(`query PostAuthor($id: ID!) { post_generic(pk: $id) { id ...PostAuthorFragment } }`, [
    PostAuthorFragment,
  ]),
);

function PostAuthorUsername(props: {
  post: PostListItemType | PostCommentTree;
  isPopover?: boolean;
  isHideAvatar?: boolean;
}) {
  const username = props.post.author?.username ?? props.post?.post_source?.user_source?.username;
  return (
    <Flex align="center" gap="gap.sm">
      {!props.isHideAvatar && (
        <Avatar.Root
          size="2xs"
          variant="subtle"
          colorPalette={getAvatarColorForUsername(username)}
          _hover={props.isPopover ? { cursor: "pointer" } : {}}
        >
          <Avatar.Fallback name={username} />
          <Avatar.Image
            src={props.post.author?.avatar?.url}
            filter="grayscale(0.4)"
            _hover={{
              filter: "grayscale(0)",
            }}
          />
        </Avatar.Root>
      )}
      <Text
        fontSize="sm"
        color="fg.muted"
        _hover={props.isPopover ? { textDecoration: "underline" } : {}}
      >
        {username}
      </Text>
    </Flex>
  );
}

export function getAvatarColorForUsername(username?: string) {
  const colorPalette = [
    "gray",
    "slate",
    "red",
    "pink",
    "purple",
    "sky",
    "cyan",
    "teal",
    "green",
    "yellow",
    "orange",
  ];
  const index = (username?.charCodeAt(0) ?? 0) % colorPalette.length;
  return colorPalette[index];
}
