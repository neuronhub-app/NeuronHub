import { layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

export const routes = [
  layout("./sites/pg/PgLayout.tsx", [
    route("/", "./sites/pg/pages/jobs/list/index.tsx"),
    route("/jobs", "./sites/pg/pages/jobs/list/index.tsx", { id: "pg-jobs-alias" }),
    route("/subscriptions", "./sites/pg/pages/jobs/subscriptions/index.tsx"),
    route(
      "/subscriptions/:id_ext",
      "./sites/pg/pages/jobs/subscriptions/access-session-by-id-ext.tsx",
    ),
    route("/subscriptions/remove/:id_ext", "./sites/pg/pages/jobs/subscriptions/remove.tsx"),
    route("/jobs/drafts", "./apps/jobs/drafts/index.tsx"),
    route("/jobs/:slug", "./sites/pg/pages/jobs/list/slug.tsx"),
    // legacy redirects
    route("/job-posting/:slug", "./sites/pg/redirects/slug-legacy-redirect-1.tsx"),
    route("/:slug", "./sites/pg/redirects/slug-legacy-redirect-2.tsx"),
    route("*", "./page-404.tsx"),
  ]),

  // #AI
  // NHA-only routes under unreachable prefix — for react-router +types generation
  // todo !! refac: drop. I don't see how this is "unreachable"
  ...prefix("/_nha", [
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
      ...prefix("/jobs", [
        route("/subscriptions", "./apps/jobs/subscriptions/index.tsx"),
        route(
          "/subscriptions/:id_ext",
          "./apps/jobs/subscriptions/access-session-by-id-ext.tsx",
        ),
        route("/subscriptions/remove/:id_ext", "./apps/jobs/subscriptions/remove.tsx"),
      ]),
      ...prefix("/profiles", [route("/", "./apps/profiles/list/index.tsx")]),
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
  ]),
] satisfies RouteConfig;
