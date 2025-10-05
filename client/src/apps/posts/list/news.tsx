import { PostList } from "@/apps/posts/list/PostList";
import { PostCategory } from "~/graphql/enums";

export default function PostListNewsRoute() {
  return <PostList category={PostCategory.News} />;
}
