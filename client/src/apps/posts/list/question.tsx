import { PostList } from "@/apps/posts/list/PostList";
import { PostCategory } from "~/graphql/enums";

export default function PostListQuestionRoute() {
  return <PostList category={PostCategory.Question} />;
}
