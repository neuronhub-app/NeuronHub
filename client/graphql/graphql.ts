/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Date with time (isoformat) */
  DateTime: { input: any; output: any };
  /** Decimal (fixed-point) */
  Decimal: { input: any; output: any };
  Upload: { input: any; output: any };
};

export type CommentType = {
  __typename?: "CommentType";
  author: UserType;
  content: Scalars["String"]["output"];
  created_at: Scalars["DateTime"]["output"];
  id: Scalars["ID"]["output"];
  parent?: Maybe<CommentType>;
  seen_by_users: Array<DjangoModelType>;
  updated_at: Scalars["DateTime"]["output"];
  visibility: Visibility;
};

export type DjangoFileType = {
  __typename?: "DjangoFileType";
  name: Scalars["String"]["output"];
  path: Scalars["String"]["output"];
  size: Scalars["Int"]["output"];
  url: Scalars["String"]["output"];
};

export type DjangoModelType = {
  __typename?: "DjangoModelType";
  pk: Scalars["ID"]["output"];
};

export type IdBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<Scalars["ID"]["input"]>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  in_list?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Assignment test. Filter will be skipped on `null` value */
  is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export enum ListFieldName {
  LibraryPosts = "library_posts",
  LibraryReviews = "library_reviews",
  ReadLaterPosts = "read_later_posts",
  ReadLaterReviews = "read_later_reviews",
}

export type ManyToManyInput = {
  add?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  remove?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  set?: InputMaybe<Array<Scalars["ID"]["input"]>>;
};

export type ManyToOneInput = {
  add?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  remove?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  set?: InputMaybe<Array<Scalars["ID"]["input"]>>;
};

export type Mutation = {
  __typename?: "Mutation";
  create_post: UserType;
  create_review: UserType;
  logout: Scalars["Boolean"]["output"];
  mutate_user_list: Scalars["Boolean"]["output"];
  update_user: UserType;
  vote_post: Scalars["Boolean"]["output"];
  vote_review: Scalars["Boolean"]["output"];
};

export type MutationCreate_PostArgs = {
  data: PostTypeInput;
};

export type MutationCreate_ReviewArgs = {
  data: ToolReviewTypeInput;
};

export type MutationMutate_User_ListArgs = {
  id: Scalars["ID"]["input"];
  is_added: Scalars["Boolean"]["input"];
  list_field_name: ListFieldName;
};

export type MutationUpdate_UserArgs = {
  data: UserTypeInput;
};

export type MutationVote_PostArgs = {
  id: Scalars["ID"]["input"];
  is_vote_positive?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationVote_ReviewArgs = {
  id: Scalars["ID"]["input"];
  is_vote_positive?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type OneToManyInput = {
  set?: InputMaybe<Scalars["ID"]["input"]>;
};

export type PostInterface = {
  author: UserType;
  comments: Array<CommentType>;
  content: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  source: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  tool?: Maybe<ToolType>;
  updated_at: Scalars["DateTime"]["output"];
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostVoteInterface>;
};

export type PostReviewType = PostInterface & {
  __typename?: "PostReviewType";
  author: UserType;
  comments: Array<CommentType>;
  content: Scalars["String"]["output"];
  experience_hours?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  importance?: Maybe<Scalars["Decimal"]["output"]>;
  is_private: Scalars["Boolean"]["output"];
  is_review_later: Scalars["Boolean"]["output"];
  rating?: Maybe<Scalars["Decimal"]["output"]>;
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  reviewed_at: Scalars["DateTime"]["output"];
  source: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  tool: ToolType;
  updated_at: Scalars["DateTime"]["output"];
  usage_status?: Maybe<UsageStatus>;
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostReviewVoteType>;
};

export type PostReviewVoteType = PostVoteInterface & {
  __typename?: "PostReviewVoteType";
  author: UserType;
  id: Scalars["ID"]["output"];
  is_vote_positive?: Maybe<Scalars["Boolean"]["output"]>;
};

export type PostType = PostInterface & {
  __typename?: "PostType";
  author: UserType;
  comments: Array<CommentType>;
  content: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  source: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  tool?: Maybe<ToolType>;
  updated_at: Scalars["DateTime"]["output"];
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostVoteType>;
};

export type PostTypeInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  title?: InputMaybe<Scalars["String"]["input"]>;
};

export type PostVoteInterface = {
  author: UserType;
  id: Scalars["ID"]["output"];
  is_vote_positive?: Maybe<Scalars["Boolean"]["output"]>;
};

export type PostVoteType = PostVoteInterface & {
  __typename?: "PostVoteType";
  author: UserType;
  id: Scalars["ID"]["output"];
  is_vote_positive?: Maybe<Scalars["Boolean"]["output"]>;
  post: DjangoModelType;
};

export type Query = {
  __typename?: "Query";
  me: UserType;
  post: PostType;
  posts: Array<PostType>;
  tool: ToolType;
  tool_review: PostReviewType;
  tool_reviews: Array<PostReviewType>;
  tool_tags: Array<ToolTagType>;
  tools: Array<ToolType>;
  user_current?: Maybe<UserType>;
};

export type QueryPostArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryToolArgs = {
  pk: Scalars["ID"]["input"];
};

export type QueryTool_ReviewArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryTool_TagsArgs = {
  filters?: InputMaybe<ToolTagFilter>;
};

export type QueryToolsArgs = {
  filters?: InputMaybe<ToolFilter>;
};

export type StrFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<Scalars["String"]["input"]>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  ends_with?: InputMaybe<Scalars["String"]["input"]>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<Scalars["String"]["input"]>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  i_contains?: InputMaybe<Scalars["String"]["input"]>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  i_ends_with?: InputMaybe<Scalars["String"]["input"]>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  i_exact?: InputMaybe<Scalars["String"]["input"]>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  i_regex?: InputMaybe<Scalars["String"]["input"]>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  i_starts_with?: InputMaybe<Scalars["String"]["input"]>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  in_list?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** Assignment test. Filter will be skipped on `null` value */
  is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<Scalars["String"]["input"]>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  starts_with?: InputMaybe<Scalars["String"]["input"]>;
};

export type ToolAlternativeTypeInput = {
  comment?: InputMaybe<Scalars["String"]["input"]>;
  is_vote_positive?: InputMaybe<Scalars["Boolean"]["input"]>;
  tool_alternative: OneToManyInput;
};

export type ToolFilter = {
  AND?: InputMaybe<ToolFilter>;
  DISTINCT?: InputMaybe<Scalars["Boolean"]["input"]>;
  NOT?: InputMaybe<ToolFilter>;
  OR?: InputMaybe<ToolFilter>;
  description?: InputMaybe<StrFilterLookup>;
  id?: InputMaybe<IdBaseFilterLookup>;
  name?: InputMaybe<StrFilterLookup>;
};

export type ToolReviewTypeInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  content_private?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  importance?: InputMaybe<Scalars["Decimal"]["input"]>;
  is_review_later?: InputMaybe<Scalars["Boolean"]["input"]>;
  rating?: InputMaybe<Scalars["Decimal"]["input"]>;
  recommended_to_groups?: InputMaybe<ManyToManyInput>;
  recommended_to_users?: InputMaybe<ManyToManyInput>;
  reviewed_at?: InputMaybe<Scalars["DateTime"]["input"]>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  tags?: InputMaybe<Array<ToolTagTypeInput>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  tool: ToolTypeInput;
  usage_status?: InputMaybe<UsageStatus>;
  visibility?: InputMaybe<Visibility>;
  visible_to_groups?: InputMaybe<ManyToManyInput>;
  visible_to_users?: InputMaybe<ManyToManyInput>;
};

export type ToolReviewVoteType = {
  __typename?: "ToolReviewVoteType";
  id: Scalars["ID"]["output"];
  is_vote_positive?: Maybe<Scalars["Boolean"]["output"]>;
  review: DjangoModelType;
};

export type ToolTagFilter = {
  AND?: InputMaybe<ToolTagFilter>;
  DISTINCT?: InputMaybe<Scalars["Boolean"]["input"]>;
  NOT?: InputMaybe<ToolTagFilter>;
  OR?: InputMaybe<ToolTagFilter>;
  description?: InputMaybe<StrFilterLookup>;
  id?: InputMaybe<IdBaseFilterLookup>;
  name?: InputMaybe<StrFilterLookup>;
};

export type ToolTagType = {
  __typename?: "ToolTagType";
  author: UserType;
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  is_important: Scalars["Boolean"]["output"];
  name: Scalars["String"]["output"];
  tag_children: Array<ToolTagType>;
  tag_parent?: Maybe<ToolTagType>;
  tools: Array<ToolType>;
  votes: Array<ToolTagVoteType>;
};

export type ToolTagTypeTag_ChildrenArgs = {
  filters?: InputMaybe<ToolTagFilter>;
};

export type ToolTagTypeToolsArgs = {
  filters?: InputMaybe<ToolFilter>;
};

export type ToolTagTypeInput = {
  comment?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  is_vote_positive?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
};

export type ToolTagVoteType = {
  __typename?: "ToolTagVoteType";
  author: UserType;
  id: Scalars["ID"]["output"];
  is_vote_positive?: Maybe<Scalars["Boolean"]["output"]>;
};

export type ToolType = {
  __typename?: "ToolType";
  alternatives: Array<ToolType>;
  crunchbase_url: Scalars["String"]["output"];
  description: Scalars["String"]["output"];
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
  tags: Array<ToolTagType>;
};

export type ToolTypeAlternativesArgs = {
  filters?: InputMaybe<ToolFilter>;
};

export type ToolTypeTagsArgs = {
  filters?: InputMaybe<ToolTagFilter>;
};

export type ToolTypeInput = {
  alternatives?: InputMaybe<Array<ToolAlternativeTypeInput>>;
  crunchbase_url?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  github_url?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  name: Scalars["String"]["input"];
  type: Scalars["String"]["input"];
};

export enum UsageStatus {
  Interested = "INTERESTED",
  NotInterested = "NOT_INTERESTED",
  Used = "USED",
  Using = "USING",
  WantToUse = "WANT_TO_USE",
}

export type UserConnectionGroupType = {
  __typename?: "UserConnectionGroupType";
  connections: Array<UserType>;
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type UserType = {
  __typename?: "UserType";
  avatar?: Maybe<DjangoFileType>;
  connection_groups: Array<UserConnectionGroupType>;
  email: Scalars["String"]["output"];
  first_name: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  last_name: Scalars["String"]["output"];
  library_comments: Array<DjangoModelType>;
  library_posts: Array<DjangoModelType>;
  library_reviews: Array<DjangoModelType>;
  library_tools: Array<DjangoModelType>;
  post_votes: Array<PostVoteType>;
  read_later_comments: Array<DjangoModelType>;
  read_later_posts: Array<DjangoModelType>;
  read_later_reviews: Array<DjangoModelType>;
  read_later_tools: Array<DjangoModelType>;
  tool_review_votes: Array<ToolReviewVoteType>;
  username: Scalars["String"]["output"];
};

export type UserTypeInput = {
  avatar?: InputMaybe<Scalars["Upload"]["input"]>;
  connection_groups?: InputMaybe<ManyToOneInput>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  library_comments?: InputMaybe<ManyToManyInput>;
  library_posts?: InputMaybe<ManyToManyInput>;
  library_reviews?: InputMaybe<ManyToManyInput>;
  library_tools?: InputMaybe<ManyToManyInput>;
  read_later_comments?: InputMaybe<ManyToManyInput>;
  read_later_posts?: InputMaybe<ManyToManyInput>;
  read_later_reviews?: InputMaybe<ManyToManyInput>;
  read_later_tools?: InputMaybe<ManyToManyInput>;
  username?: InputMaybe<Scalars["String"]["input"]>;
};

export enum Visibility {
  Connections = "CONNECTIONS",
  ConnectionGroupsSelected = "CONNECTION_GROUPS_SELECTED",
  Internal = "INTERNAL",
  Private = "PRIVATE",
  Public = "PUBLIC",
  Subscribers = "SUBSCRIBERS",
  SubscribersPaid = "SUBSCRIBERS_PAID",
  UsersSelected = "USERS_SELECTED",
}

export type PostDetailQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type PostDetailQuery = {
  __typename?: "Query";
  post: { __typename?: "PostType" } & {
    " $fragmentRefs"?: { PostDetailFragmentFragment: PostDetailFragmentFragment };
  };
};

export type PostListQueryVariables = Exact<{ [key: string]: never }>;

export type PostListQuery = {
  __typename?: "Query";
  posts: Array<
    { __typename?: "PostType" } & {
      " $fragmentRefs"?: { PostFragment_PostType_Fragment: PostFragment_PostType_Fragment };
    }
  >;
};

export type ToolTagsQueryQueryVariables = Exact<{
  name?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ToolTagsQueryQuery = {
  __typename?: "Query";
  tool_tags: Array<{
    __typename?: "ToolTagType";
    id: string;
    name: string;
    tag_parent?: { __typename?: "ToolTagType"; id: string; name: string } | null;
  }>;
};

export type ToolAlternativesQueryQueryVariables = Exact<{
  name?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ToolAlternativesQueryQuery = {
  __typename?: "Query";
  tools: Array<{ __typename?: "ToolType"; id: string; name: string }>;
};

export type CreateReviewMutationVariables = Exact<{
  input: ToolReviewTypeInput;
}>;

export type CreateReviewMutation = {
  __typename?: "Mutation";
  create_review: { __typename?: "UserType"; id: string };
};

export type PostReviewDetailQueryVariables = Exact<{
  id: Scalars["ID"]["input"];
}>;

export type PostReviewDetailQuery = {
  __typename?: "Query";
  tool_review: { __typename?: "PostReviewType" } & {
    " $fragmentRefs"?: { PostReviewDetailFragmentFragment: PostReviewDetailFragmentFragment };
  };
};

export type ReviewListQueryVariables = Exact<{ [key: string]: never }>;

export type ReviewListQuery = {
  __typename?: "Query";
  tool_reviews: Array<
    { __typename?: "PostReviewType" } & {
      " $fragmentRefs"?: { PostReviewFragmentFragment: PostReviewFragmentFragment };
    }
  >;
};

export type UserCurrentQueryVariables = Exact<{ [key: string]: never }>;

export type UserCurrentQuery = {
  __typename?: "Query";
  user_current?: {
    __typename?: "UserType";
    id: string;
    username: string;
    email: string;
    name: string;
    library_posts: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    library_reviews: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    read_later_posts: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    read_later_reviews: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    tool_review_votes: Array<{
      __typename?: "ToolReviewVoteType";
      id: string;
      is_vote_positive?: boolean | null;
      review: { __typename?: "DjangoModelType"; pk: string };
    }>;
    post_votes: Array<{
      __typename?: "PostVoteType";
      id: string;
      is_vote_positive?: boolean | null;
      post: { __typename?: "DjangoModelType"; pk: string };
    }>;
    connection_groups: Array<{
      __typename?: "UserConnectionGroupType";
      id: string;
      name: string;
      connections: Array<{
        __typename?: "UserType";
        id: string;
        username: string;
        name: string;
      }>;
    }>;
  } | null;
};

export type Vote_ReviewMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  isVotePositive?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type Vote_ReviewMutation = { __typename?: "Mutation"; vote_review: boolean };

export type Vote_PostMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  isVotePositive?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type Vote_PostMutation = { __typename?: "Mutation"; vote_post: boolean };

export type Mutate_User_ListMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  list_field_name: ListFieldName;
  is_added: Scalars["Boolean"]["input"];
}>;

export type Mutate_User_ListMutation = { __typename?: "Mutation"; mutate_user_list: boolean };

type PostWithoutToolFragment_PostReviewType_Fragment = {
  __typename?: "PostReviewType";
  id: string;
  title: string;
  content: string;
  source: string;
  updated_at: any;
  author: {
    __typename?: "UserType";
    id: string;
    username: string;
    avatar?: { __typename?: "DjangoFileType"; url: string } | null;
  };
  votes: Array<{
    __typename?: "PostReviewVoteType";
    id: string;
    is_vote_positive?: boolean | null;
  }>;
  comments: Array<{ __typename?: "CommentType"; id: string }>;
} & { " $fragmentName"?: "PostWithoutToolFragment_PostReviewType_Fragment" };

type PostWithoutToolFragment_PostType_Fragment = {
  __typename?: "PostType";
  id: string;
  title: string;
  content: string;
  source: string;
  updated_at: any;
  author: {
    __typename?: "UserType";
    id: string;
    username: string;
    avatar?: { __typename?: "DjangoFileType"; url: string } | null;
  };
  votes: Array<{ __typename?: "PostVoteType"; id: string; is_vote_positive?: boolean | null }>;
  comments: Array<{ __typename?: "CommentType"; id: string }>;
} & { " $fragmentName"?: "PostWithoutToolFragment_PostType_Fragment" };

export type PostWithoutToolFragmentFragment =
  | PostWithoutToolFragment_PostReviewType_Fragment
  | PostWithoutToolFragment_PostType_Fragment;

type PostFragment_PostReviewType_Fragment = ({
  __typename?: "PostReviewType";
  tool: { __typename?: "ToolType" } & {
    " $fragmentRefs"?: { ToolFragmentFragment: ToolFragmentFragment };
  };
} & {
  " $fragmentRefs"?: {
    PostWithoutToolFragment_PostReviewType_Fragment: PostWithoutToolFragment_PostReviewType_Fragment;
  };
}) & { " $fragmentName"?: "PostFragment_PostReviewType_Fragment" };

type PostFragment_PostType_Fragment = ({
  __typename?: "PostType";
  tool?:
    | ({ __typename?: "ToolType" } & {
        " $fragmentRefs"?: { ToolFragmentFragment: ToolFragmentFragment };
      })
    | null;
} & {
  " $fragmentRefs"?: {
    PostWithoutToolFragment_PostType_Fragment: PostWithoutToolFragment_PostType_Fragment;
  };
}) & { " $fragmentName"?: "PostFragment_PostType_Fragment" };

export type PostFragmentFragment =
  | PostFragment_PostReviewType_Fragment
  | PostFragment_PostType_Fragment;

type PostCommentsFragment_PostReviewType_Fragment = {
  __typename?: "PostReviewType";
  comments: Array<{
    __typename?: "CommentType";
    id: string;
    created_at: any;
    content: string;
    visibility: Visibility;
    author: {
      __typename?: "UserType";
      id: string;
      username: string;
      avatar?: { __typename?: "DjangoFileType"; url: string } | null;
    };
    parent?: { __typename?: "CommentType"; id: string } | null;
  }>;
} & { " $fragmentName"?: "PostCommentsFragment_PostReviewType_Fragment" };

type PostCommentsFragment_PostType_Fragment = {
  __typename?: "PostType";
  comments: Array<{
    __typename?: "CommentType";
    id: string;
    created_at: any;
    content: string;
    visibility: Visibility;
    author: {
      __typename?: "UserType";
      id: string;
      username: string;
      avatar?: { __typename?: "DjangoFileType"; url: string } | null;
    };
    parent?: { __typename?: "CommentType"; id: string } | null;
  }>;
} & { " $fragmentName"?: "PostCommentsFragment_PostType_Fragment" };

export type PostCommentsFragmentFragment =
  | PostCommentsFragment_PostReviewType_Fragment
  | PostCommentsFragment_PostType_Fragment;

export type PostDetailFragmentFragment = ({ __typename?: "PostType" } & {
  " $fragmentRefs"?: {
    PostFragment_PostType_Fragment: PostFragment_PostType_Fragment;
    PostCommentsFragment_PostType_Fragment: PostCommentsFragment_PostType_Fragment;
  };
}) & { " $fragmentName"?: "PostDetailFragmentFragment" };

export type PostReviewFragmentFragment = ({
  __typename?: "PostReviewType";
  importance?: any | null;
  is_private: boolean;
  is_review_later: boolean;
  usage_status?: UsageStatus | null;
  rating?: any | null;
  experience_hours?: number | null;
  reviewed_at: any;
  tool: { __typename?: "ToolType" } & {
    " $fragmentRefs"?: { ToolFragmentFragment: ToolFragmentFragment };
  };
} & {
  " $fragmentRefs"?: {
    PostWithoutToolFragment_PostReviewType_Fragment: PostWithoutToolFragment_PostReviewType_Fragment;
  };
}) & { " $fragmentName"?: "PostReviewFragmentFragment" };

export type PostReviewDetailFragmentFragment = ({ __typename?: "PostReviewType" } & {
  " $fragmentRefs"?: {
    PostReviewFragmentFragment: PostReviewFragmentFragment;
    PostCommentsFragment_PostReviewType_Fragment: PostCommentsFragment_PostReviewType_Fragment;
  };
}) & { " $fragmentName"?: "PostReviewDetailFragmentFragment" };

export type ToolTagFragmentFragment = {
  __typename?: "ToolTagType";
  id: string;
  name: string;
  description: string;
  is_important: boolean;
  tag_parent?: { __typename?: "ToolTagType"; id: string; name: string } | null;
  author: { __typename?: "UserType"; id: string; username: string };
  votes: Array<{
    __typename?: "ToolTagVoteType";
    id: string;
    is_vote_positive?: boolean | null;
    author: { __typename?: "UserType"; id: string; username: string };
  }>;
} & { " $fragmentName"?: "ToolTagFragmentFragment" };

export type ToolFragmentFragment = {
  __typename?: "ToolType";
  id: string;
  name: string;
  github_url: string;
  crunchbase_url: string;
  tags: Array<
    { __typename?: "ToolTagType" } & {
      " $fragmentRefs"?: { ToolTagFragmentFragment: ToolTagFragmentFragment };
    }
  >;
} & { " $fragmentName"?: "ToolFragmentFragment" };

export const PostWithoutToolFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostWithoutToolFragmentFragment, unknown>;
export const ToolTagFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ToolTagFragmentFragment, unknown>;
export const ToolFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ToolFragmentFragment, unknown>;
export const PostFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostFragmentFragment, unknown>;
export const PostCommentsFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostCommentsFragmentFragment, unknown>;
export const PostDetailFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostDetailFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostCommentsFragment" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostDetailFragmentFragment, unknown>;
export const PostReviewFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostReviewFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostReviewType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          { kind: "Field", name: { kind: "Name", value: "importance" } },
          { kind: "Field", name: { kind: "Name", value: "is_private" } },
          { kind: "Field", name: { kind: "Name", value: "is_review_later" } },
          { kind: "Field", name: { kind: "Name", value: "usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "rating" } },
          { kind: "Field", name: { kind: "Name", value: "experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostReviewFragmentFragment, unknown>;
export const PostReviewDetailFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostReviewDetailFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostReviewType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostReviewFragment" } },
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostCommentsFragment" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostReviewFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostReviewType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          { kind: "Field", name: { kind: "Name", value: "importance" } },
          { kind: "Field", name: { kind: "Name", value: "is_private" } },
          { kind: "Field", name: { kind: "Name", value: "is_review_later" } },
          { kind: "Field", name: { kind: "Name", value: "usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "rating" } },
          { kind: "Field", name: { kind: "Name", value: "experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostReviewDetailFragmentFragment, unknown>;
export const PostDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PostDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "post" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostDetailFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostDetailFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostCommentsFragment" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostDetailQuery, PostDetailQueryVariables>;
export const PostListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PostList" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "posts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostListQuery, PostListQueryVariables>;
export const ToolTagsQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ToolTagsQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "tool_tags" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "contains" },
                            value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                          },
                        ],
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "description" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "contains" },
                            value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tag_parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ToolTagsQueryQuery, ToolTagsQueryQueryVariables>;
export const ToolAlternativesQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ToolAlternativesQuery" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "name" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "String" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "tools" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "name" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "contains" },
                            value: { kind: "Variable", name: { kind: "Name", value: "name" } },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ToolAlternativesQueryQuery, ToolAlternativesQueryQueryVariables>;
export const CreateReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateReview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ToolReviewTypeInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "create_review" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "data" },
                value: { kind: "Variable", name: { kind: "Name", value: "input" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateReviewMutation, CreateReviewMutationVariables>;
export const PostReviewDetailDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PostReviewDetail" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "tool_review" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "PostReviewDetailFragment" },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostReviewFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostReviewType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          { kind: "Field", name: { kind: "Name", value: "importance" } },
          { kind: "Field", name: { kind: "Name", value: "is_private" } },
          { kind: "Field", name: { kind: "Name", value: "is_review_later" } },
          { kind: "Field", name: { kind: "Name", value: "usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "rating" } },
          { kind: "Field", name: { kind: "Name", value: "experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                        },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostReviewDetailFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostReviewType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostReviewFragment" } },
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostCommentsFragment" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostReviewDetailQuery, PostReviewDetailQueryVariables>;
export const ReviewListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "ReviewList" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "tool_reviews" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostReviewFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostWithoutToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostInterface" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "avatar" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "url" } }],
                  },
                },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "comments" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "description" } },
          { kind: "Field", name: { kind: "Name", value: "is_important" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tag_parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "author" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "username" } },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ToolFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "ToolType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "name" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostReviewFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostReviewType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostWithoutToolFragment" } },
          { kind: "Field", name: { kind: "Name", value: "importance" } },
          { kind: "Field", name: { kind: "Name", value: "is_private" } },
          { kind: "Field", name: { kind: "Name", value: "is_review_later" } },
          { kind: "Field", name: { kind: "Name", value: "usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "rating" } },
          { kind: "Field", name: { kind: "Name", value: "experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tool" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "ToolFragment" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReviewListQuery, ReviewListQueryVariables>;
export const UserCurrentDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserCurrent" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user_current" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "username" } },
                {
                  kind: "Field",
                  alias: { kind: "Name", value: "name" },
                  name: { kind: "Name", value: "username" },
                },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "library_posts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "library_reviews" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "read_later_posts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "read_later_reviews" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tool_review_votes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "review" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "post_votes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "post" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "connection_groups" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "connections" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "username" } },
                            {
                              kind: "Field",
                              alias: { kind: "Name", value: "name" },
                              name: { kind: "Name", value: "username" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserCurrentQuery, UserCurrentQueryVariables>;
export const Vote_ReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "vote_review" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isVotePositive" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "vote_review" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "is_vote_positive" },
                value: { kind: "Variable", name: { kind: "Name", value: "isVotePositive" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Vote_ReviewMutation, Vote_ReviewMutationVariables>;
export const Vote_PostDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "vote_post" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isVotePositive" } },
          type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "vote_post" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "is_vote_positive" },
                value: { kind: "Variable", name: { kind: "Name", value: "isVotePositive" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Vote_PostMutation, Vote_PostMutationVariables>;
export const Mutate_User_ListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "mutate_user_list" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "list_field_name" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ListFieldName" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "is_added" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Boolean" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "mutate_user_list" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "list_field_name" },
                value: { kind: "Variable", name: { kind: "Name", value: "list_field_name" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "is_added" },
                value: { kind: "Variable", name: { kind: "Name", value: "is_added" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<Mutate_User_ListMutation, Mutate_User_ListMutationVariables>;
