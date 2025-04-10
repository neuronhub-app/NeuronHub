import { type RouteConfig, layout, prefix, route } from "@react-router/dev/routes";

export default [
  layout("./components/layout/index.tsx", [
    ...prefix("reviews", [
      route("/", "./apps/reviews/list/index.tsx"),
      route("/create", "./apps/reviews/create/index.tsx"),
    ]),
    ...prefix("user/settings", [
      layout("./apps/users/settings/UserSettingsLayout.tsx", [
        route("profile", "./apps/users/settings/profile/index.tsx"),
        route("connections", "./apps/users/settings/connections/index.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
