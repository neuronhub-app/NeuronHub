import { PostCategory } from "~/graphql/enums";

import { PostListAlgolia } from "@/apps/posts/list/PostListAlgolia";

export default function PostListKnowledgeRoute() {
  return <PostListAlgolia category={PostCategory.Knowledge} />;
}
