import { layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";
import type { ID } from "@/gql-tada";

export default [
  layout("./components/layout/index.tsx", [
    ...prefix("/reviews", [
      route("/", "./apps/reviews/list/index.tsx"),
      route("/create", "./apps/reviews/create/index.tsx"),
      route("/:id", "./apps/reviews/detail/index.tsx"),
    ]),
    ...prefix("/posts", [
      route("/", "./apps/posts/list/index.tsx"),
      route("/create", "./apps/posts/create/index.tsx"),
      route("/:id", "./apps/posts/detail/index.tsx"),
    ]),
    ...prefix("/user/settings", [
      layout("./apps/users/settings/UserSettingsLayout.tsx", [
        route("/profile", "./apps/users/settings/profile/index.tsx"),
        route("/connections", "./apps/users/settings/connections/index.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;

export const urls = {
  home: "/",
  get reviews() {
    return {
      get list() {
        return "/reviews" as const;
      },
      get create() {
        return `${urls.reviews.list}/create` as const;
      },
      detail(id: ID) {
        return `${urls.reviews.list}/${id}` as const;
      },
    };
  },
  get posts() {
    return {
      get list() {
        return "/posts" as const;
      },
      get create() {
        return `${urls.posts.list}/create` as const;
      },
      detail(id: ID) {
        return `${urls.posts.list}/${id}` as const;
      },
    };
  },
  get user() {
    return {
      get settings() {
        return {
          get detail() {
            return `/user/settings` as const;
          },
          get profile() {
            return `${this.detail}/profile` as const;
          },
          get connections() {
            return `${this.detail}/connections` as const;
          },
          get notifications() {
            return `${this.detail}/notifications` as const;
          },
        };
      },
    };
  },
} as const;
