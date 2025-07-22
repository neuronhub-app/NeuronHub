import { graphql } from "@/gql-tada";
import { mutateAndRefetch } from "@/urql/mutateAndRefetch";

const CREATE_POST_COMMENT_MUTATION = graphql(`
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
`);

export interface CreatePostCommentInput {
  parentId: string;
  content: string;
}

export async function createPostComment(input: CreatePostCommentInput) {
  const result = await mutateAndRefetch(CREATE_POST_COMMENT_MUTATION, {
    data: {
      parent: { id: input.parentId, tags: [] },
      content: input.content,
      tags: [],
      visibility: "PUBLIC",
    },
  });

  return result;
}
