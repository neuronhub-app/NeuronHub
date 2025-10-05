import { PostList } from "@/apps/posts/list/PostList";
import { PostCategory } from "~/graphql/enums";

export default function PostListKnowledgeRoute() {
  return <PostList category={PostCategory.Knowledge} />;
}
