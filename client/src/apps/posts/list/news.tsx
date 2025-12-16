import { PostListAlgolia } from "@/apps/posts/list/PostListAlgolia";
import { PostCategory } from "~/graphql/enums";

export default function PostListNewsRoute() {
  return <PostListAlgolia category={PostCategory.News} />;
}
