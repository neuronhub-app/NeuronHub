import { graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";

export async function createPostComment(input: { parentId: string; content: string }) {
  return mutateAndRefetch(
    graphql(`
      mutation CreatePostComment($data: PostTypeInput!) {
        create_post_comment(data: $data) {
          id
          type
          content
          author {
            id
            username
          }
          parent {
            id
          }
          created_at
        }
      }
    `),
    {
      data: {
        parent: { id: input.parentId, tags: [] },
        content: input.content,
        tags: [],
        visibility: "PUBLIC",
      },
    },
  );
}
