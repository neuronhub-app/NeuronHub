import { PostListAlgolia } from "@/apps/posts/list/PostListAlgolia";
import { PostCategory } from "~/graphql/enums";

export default function PostListQuestionRoute() {
  return <PostListAlgolia category={PostCategory.Question} />;
}
