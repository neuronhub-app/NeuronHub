import { PostList } from "@/apps/posts/list/PostList";
import { PostCategory } from "~/graphql/enums";

export default function PostListOpinionRoute() {
  return <PostList category={PostCategory.Opinion} />;
}
