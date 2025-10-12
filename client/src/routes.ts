import { layout, prefix, type RouteConfig, route } from "@react-router/dev/routes";
import type { PostListItemType } from "@/components/posts/ListContainer";
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
    get knowledge() {
      // todo refac: use enums, not magic strs. but react-router breaks on import
      return `${this.list}/knowledge` as const;
    },
    get opinion() {
      return `${this.list}/opinion` as const;
    },
    get news() {
      return `${this.list}/news` as const;
    },
    get question() {
      return `${this.list}/question` as const;
    },
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
  getPostUrls(post: PostListItemType) {
    let urlsSet: PostUrls = this.posts;
    // import @/graphql/fragments/reviews isReview() kills react-router
    if (post.__typename === "PostReviewType") {
      urlsSet = this.reviews;
    }
    if (post.__typename === "PostToolType") {
      urlsSet = this.tools;
    }
    return {
      detail: urlsSet.detail(post.id),
      edit: urlsSet.edit(post.id),
    };
  },
} as const;

type PostUrls = typeof urls.posts | typeof urls.reviews | typeof urls.tools;

const op = { create: "create", edit: "edit" } as const;

export default [
  layout("./components/layout/index.tsx", [
    route("/", "./apps/home/index.tsx"),
    ...prefix(urls.reviews.list, [
      route("/", "./apps/reviews/list/index.tsx"),
      route(`/${op.create}`, "./apps/reviews/create/index.tsx"),
      route("/:id", "./apps/reviews/detail/index.tsx"),
      route(`/:id/${op.edit}`, "./apps/reviews/edit/index.tsx"),
    ]),
    ...prefix(urls.posts.list, [
      route("/", "./apps/posts/list/index.tsx"),
      route("/knowledge", "./apps/posts/list/knowledge.tsx"),
      route("/opinion", "./apps/posts/list/opinion.tsx"),
      route("/news", "./apps/posts/list/news.tsx"),
      route("/question", "./apps/posts/list/question.tsx"),
      route(`/${op.create}`, "./apps/posts/create/index.tsx"),
      route("/:id", "./apps/posts/detail/index.tsx"),
      route(`/:id/${op.edit}`, "./apps/posts/edit/index.tsx"),
    ]),
    ...prefix(urls.tools.list, [
      route("/", "./apps/tools/list/index.tsx"),
      route(`/${op.create}`, "./apps/tools/create/index.tsx"),
      route("/:id", "./apps/tools/detail/index.tsx"),
      route(`/:id/${op.edit}`, "./apps/tools/edit/index.tsx"),
    ]),
    ...prefix(urls.user.settings.detail, [
      layout("./apps/users/settings/UserSettingsLayout.tsx", [
        route("/profile", "./apps/users/settings/profile/index.tsx"),
        route("/connections", "./apps/users/settings/connections/index.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
