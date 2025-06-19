import { layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";

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
  reviews: {
    $: "reviews",
    create: {
      $: "create",
      get path() {
        return `/${urls.reviews.$}/${urls.reviews.create.$}` as const;
      },
    },
  },
  posts: {
    $: "posts",
    create: {
      $: "create",
      get path() {
        return `/${urls.posts.$}/${urls.posts.create.$}` as const;
      },
    },
  },
  user: {
    $: "user",
    settings: {
      $: "settings",
      get path() {
        return `/${urls.user.$}/${urls.user.settings.$}` as const;
      },

      profile: {
        $: "profile",
        get path() {
          const user = urls.user;
          return `/${user.$}/${user.settings.$}/${user.settings.profile.$}` as const;
        },
      },

      connections: {
        $: "connections",
        get path() {
          const user = urls.user;
          return `/${user.$}/${user.settings.$}/${user.settings.connections.$}` as const;
        },
      },

      notifications: {
        $: "notifications",
        get path() {
          const user = urls.user;
          return `/${user.$}/${user.settings.$}/${user.settings.notifications.$}` as const;
        },
      },
    },
  },
} as const;
