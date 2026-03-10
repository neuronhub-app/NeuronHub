import { layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

// ViteNodeRunner can't resolve `@/` aliases — route config files must use inline strings
export default [
  layout("./sites/neuronhub/NeuronLayout.tsx", [
    route("/", "./apps/home/index.tsx"),
    route("/login", "./apps/auth/login/index.tsx"),
    route("/library", "./apps/library/index.tsx"),
    ...prefix("/reviews", [
      route("/", "./apps/reviews/list/index.tsx"),
      route("/:id", "./apps/reviews/detail/index.tsx"),
      route("/create", "./apps/reviews/create/index.tsx"),
      route("/:id/edit", "./apps/reviews/edit/index.tsx"),
    ]),
    ...prefix("/posts", [
      route("/", "./apps/posts/list/index.tsx"),
      route("/knowledge", "./apps/posts/list/knowledge.tsx"),
      route("/opinion", "./apps/posts/list/opinion.tsx"),
      route("/news", "./apps/posts/list/news.tsx"),
      route("/question", "./apps/posts/list/question.tsx"),
      route("/:id", "./apps/posts/detail/index.tsx"),
      route("/create", "./apps/posts/create/index.tsx"),
      route("/:id/edit", "./apps/posts/edit/index.tsx"),
    ]),
    ...prefix("/profiles", [route("/", "./apps/profiles/list/index.tsx")]),
    ...prefix("/jobs", [
      route("/", "./apps/jobs/list/index.tsx"),
      route("/faq", "./apps/jobs/faq/index.tsx"),
      route("/subscriptions", "./apps/jobs/subscriptions/index.tsx"),
      route("/subscriptions/remove/:id_ext", "./apps/jobs/subscriptions/remove.tsx"),
      route("/versions", "./apps/jobs/versions/index.tsx"),
      route("/:slug", "./apps/jobs/list/slug.tsx"),
    ]),
    ...prefix("/tools", [
      route("/", "./apps/tools/list/index.tsx"),
      route("/:id", "./apps/tools/detail/index.tsx"),
      route("/create", "./apps/tools/create/index.tsx"),
      route("/:id/edit", "./apps/tools/edit/index.tsx"),
    ]),
    ...prefix("/user/settings", [
      layout("./apps/users/settings/UserSettingsLayout.tsx", [
        route("/profile", "./apps/users/settings/profile/index.tsx"),
        route("/llm-profile", "./apps/users/settings/llm-profile/index.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
