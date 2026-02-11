// todo refac-name: use singular namespaces, ie `review` not `reviews`
import type { PostListItemType } from "@/components/posts/ListContainer";
import type { ID } from "@/gql-tada";

type PostUrls = typeof urls.posts | typeof urls.reviews | typeof urls.tools;

export const op = { create: "create", edit: "edit" } as const;

export const urls = {
  home: "/",
  login: "/login",
  library: "/library",
  readingList: "/reading-list",
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
  profiles: {
    list: "/profiles",
    detail(id: ID) {
      return `${this.list}/${id}` as const;
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
