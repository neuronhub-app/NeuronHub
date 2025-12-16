import { PostListAlgolia } from "@/apps/posts/list/PostListAlgolia";
import { PostCategory } from "~/graphql/enums";

export default function PostListOpinionRoute() {
  return <PostListAlgolia category={PostCategory.Opinion} />;
}
