import { PostCategory } from "~/graphql/enums";

import { PostListAlgolia } from "@/apps/posts/list/PostListAlgolia";

export default function PostListNewsRoute() {
  return <PostListAlgolia category={PostCategory.News} />;
}
