import { layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";
import type { ID } from "@/gql-tada";

export const urls = {
  home: "/",
  login: "/login",
  reviews: {
    list: "/reviews",
    get create() {
      return `${this.list}/${op.create}` as const;
    },
    detail(id: ID) {
      return `${this.list}/${id}` as const;
    },
    edit(id: ID) {
      return `${this.list}/${id}/${op.edit}` as const;
    },
  },
  posts: {
    list: "/posts",
    get create() {
      return `${this.list}/${op.create}` as const;
    },
    detail(id: ID) {
      return `${this.list}/${id}` as const;
    },
    edit(id: ID) {
      return `${this.list}/${id}/${op.edit}` as const;
    },
  },
  tools: {
    list: "/tools",
    get create() {
      return `${this.list}/${op.create}` as const;
    },
    detail(id: ID) {
      return `${this.list}/${id}` as const;
    },
    edit(id: ID) {
      return `${this.list}/${id}/${op.edit}` as const;
    },
  },
  user: {
    settings: {
      detail: "/user/settings",
      get profile() {
        return `${this.detail}/profile` as const;
      },
      get connections() {
        return `${this.detail}/connections` as const;
      },
      get notifications() {
        return `${this.detail}/notifications` as const;
      },
    },
  },
} as const;

const op = { create: "create", edit: "edit" } as const;

export default [
  route("/login", "./apps/auth/login/index.tsx"),
  layout("./components/layout/index.tsx", [
    ...prefix(urls.reviews.list, [
      route("/", "./apps/reviews/list/index.tsx"),
      route(`/${op.create}`, "./apps/reviews/create/index.tsx"),
      route("/:id", "./apps/reviews/detail/index.tsx"),
      route(`/:id/${op.edit}`, "./apps/reviews/edit/index.tsx"),
    ]),
    ...prefix(urls.posts.list, [
      route("/", "./apps/posts/list/index.tsx"),
      route("/:id", "./apps/posts/detail/index.tsx"),
      route(`/:id/${op.edit}`, "./apps/posts/edit/index.tsx"),
    ]),
    ...prefix(urls.tools.list, [
      route("/", "./apps/tools/list/index.tsx"),
      route(`/${op.create}`, "./apps/tools/create/index.tsx"),
    ]),
    ...prefix(urls.user.settings.detail, [
      layout("./apps/users/settings/UserSettingsLayout.tsx", [
        route("/profile", "./apps/users/settings/profile/index.tsx"),
        route("/connections", "./apps/users/settings/connections/index.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
