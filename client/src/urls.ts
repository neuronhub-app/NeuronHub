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
