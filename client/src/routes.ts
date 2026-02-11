import { prefix, type RouteConfig, route } from "@react-router/dev/routes";
import { op, urls } from "./urls";

export default [
  route("/", "./apps/home/index.tsx"),
  route("/login", "./apps/auth/login/index.tsx"),
  route(urls.library, "./apps/library/index.tsx"),
  ...prefix(urls.reviews.list, [
    route("/", "./apps/reviews/list/index.tsx"),
    route("/:id", "./apps/reviews/detail/index.tsx"),
    route(`/${op.create}`, "./apps/reviews/create/index.tsx"),
    route(`/:id/${op.edit}`, "./apps/reviews/edit/index.tsx"),
  ]),
  ...prefix(urls.posts.list, [
    route("/", "./apps/posts/list/index.tsx"),
    route("/knowledge", "./apps/posts/list/knowledge.tsx"),
    route("/opinion", "./apps/posts/list/opinion.tsx"),
    route("/news", "./apps/posts/list/news.tsx"),
    route("/question", "./apps/posts/list/question.tsx"),
    route("/:id", "./apps/posts/detail/index.tsx"),
    route(`/${op.create}`, "./apps/posts/create/index.tsx"),
    route(`/:id/${op.edit}`, "./apps/posts/edit/index.tsx"),
  ]),
  ...prefix(urls.profiles.list, [route("/", "./apps/profiles/list/index.tsx")]),
  ...prefix(urls.tools.list, [
    route("/", "./apps/tools/list/index.tsx"),
    route("/:id", "./apps/tools/detail/index.tsx"),
    route(`/${op.create}`, "./apps/tools/create/index.tsx"),
    route(`/:id/${op.edit}`, "./apps/tools/edit/index.tsx"),
  ]),
  ...prefix(urls.user.settings.detail, [
    route("/profile", "./apps/users/settings/profile/index.tsx"),
    route("/connections", "./apps/users/settings/connections/index.tsx"),
  ]),
] satisfies RouteConfig;
