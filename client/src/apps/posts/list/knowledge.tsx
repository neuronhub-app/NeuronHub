import { PostListAlgolia } from "@/apps/posts/list/PostListAlgolia";
import { PostCategory } from "~/graphql/enums";

export default function PostListKnowledgeRoute() {
  return <PostListAlgolia category={PostCategory.Knowledge} />;
}
