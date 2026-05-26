import { PostCategory } from "~/graphql/enums";

import { PostListAlgolia } from "@/apps/posts/list/PostListAlgolia";

export default function PostListOpinionRoute() {
  return <PostListAlgolia category={PostCategory.Opinion} />;
}
