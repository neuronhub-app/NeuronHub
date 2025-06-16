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
  create_or_update_post_vote: Scalars["Boolean"]["output"];
  create_post: UserType;
  create_post_comment: PostCommentType;
  create_post_review: UserType;
  logout: Scalars["Boolean"]["output"];
  update_post: PostType;
  update_post_seen_status: Scalars["Boolean"]["output"];
  update_user: UserType;
  update_user_list: Scalars["Boolean"]["output"];
};

export type MutationCreate_Or_Update_Post_VoteArgs = {
  id: Scalars["ID"]["input"];
  is_changed_my_mind?: InputMaybe<Scalars["Boolean"]["input"]>;
  is_vote_positive?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type MutationCreate_PostArgs = {
  data: PostTypeInput;
};

export type MutationCreate_Post_CommentArgs = {
  data: PostTypeInput;
};

export type MutationCreate_Post_ReviewArgs = {
  data: PostTypeInput;
};

export type MutationUpdate_PostArgs = {
  data: PostTypeInput;
};

export type MutationUpdate_Post_Seen_StatusArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationUpdate_UserArgs = {
  data: UserTypeInput;
};

export type MutationUpdate_User_ListArgs = {
  id: Scalars["ID"]["input"];
  is_added: Scalars["Boolean"]["input"];
  list_field_name: UserListName;
};

export type OneToManyInput = {
  set?: InputMaybe<Scalars["ID"]["input"]>;
};

export type PostCommentType = PostTypeI & {
  __typename?: "PostCommentType";
  author: UserType;
  children: Array<PostCommentType>;
  company?: Maybe<DjangoModelType>;
  content: Scalars["String"]["output"];
  content_private: Scalars["String"]["output"];
  created_at: Scalars["DateTime"]["output"];
  crunchbase_url: Scalars["String"]["output"];
  domain: Scalars["String"]["output"];
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  parent?: Maybe<PostCommentType>;
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  seen_by_users: Array<DjangoModelType>;
  source: Scalars["String"]["output"];
  tag_votes: Array<PostTagVoteType>;
  tags: Array<PostTagType>;
  title: Scalars["String"]["output"];
  type: PostTypeEnum;
  updated_at: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostVoteType>;
};

export type PostCommentTypeChildrenArgs = {
  filters?: InputMaybe<PostFilter>;
};

export type PostCommentTypeTagsArgs = {
  filters?: InputMaybe<PostTagFilter>;
};

export type PostFilter = {
  AND?: InputMaybe<PostFilter>;
  DISTINCT?: InputMaybe<Scalars["Boolean"]["input"]>;
  NOT?: InputMaybe<PostFilter>;
  OR?: InputMaybe<PostFilter>;
  title?: InputMaybe<StrFilterLookup>;
  type?: InputMaybe<PostTypeEnumFilterLookup>;
};

export type PostReviewType = PostTypeI & {
  __typename?: "PostReviewType";
  author: UserType;
  children: Array<PostTypeI>;
  company?: Maybe<DjangoModelType>;
  content: Scalars["String"]["output"];
  content_private: Scalars["String"]["output"];
  created_at: Scalars["DateTime"]["output"];
  crunchbase_url: Scalars["String"]["output"];
  domain: Scalars["String"]["output"];
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  parent?: Maybe<PostToolType>;
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  review_experience_hours?: Maybe<Scalars["Int"]["output"]>;
  review_importance?: Maybe<Scalars["Decimal"]["output"]>;
  review_rating?: Maybe<Scalars["Decimal"]["output"]>;
  review_usage_status?: Maybe<UsageStatus>;
  reviewed_at: Scalars["DateTime"]["output"];
  seen_by_users: Array<DjangoModelType>;
  source: Scalars["String"]["output"];
  tag_votes: Array<PostTagVoteType>;
  tags: Array<PostTagType>;
  title: Scalars["String"]["output"];
  type: PostTypeEnum;
  updated_at: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostVoteType>;
};

export type PostReviewTypeTagsArgs = {
  filters?: InputMaybe<PostTagFilter>;
};

export type PostTagFilter = {
  AND?: InputMaybe<PostTagFilter>;
  DISTINCT?: InputMaybe<Scalars["Boolean"]["input"]>;
  NOT?: InputMaybe<PostTagFilter>;
  OR?: InputMaybe<PostTagFilter>;
  description?: InputMaybe<StrFilterLookup>;
  id?: InputMaybe<IdBaseFilterLookup>;
  name?: InputMaybe<StrFilterLookup>;
};

export type PostTagType = {
  __typename?: "PostTagType";
  author: UserType;
  description: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  is_important?: Maybe<Scalars["Boolean"]["output"]>;
  name: Scalars["String"]["output"];
  posts: Array<PostType>;
  tag_children: Array<PostTagType>;
  tag_parent?: Maybe<PostTagType>;
  votes: Array<PostTagVoteType>;
};

export type PostTagTypePostsArgs = {
  filters?: InputMaybe<PostFilter>;
};

export type PostTagTypeTag_ChildrenArgs = {
  filters?: InputMaybe<PostTagFilter>;
};

export type PostTagTypeInput = {
  description: Scalars["String"]["input"];
  id?: InputMaybe<Scalars["ID"]["input"]>;
  is_important?: InputMaybe<Scalars["Boolean"]["input"]>;
  is_vote_positive?: InputMaybe<Scalars["Boolean"]["input"]>;
  name: Scalars["String"]["input"];
};

export type PostTagVoteType = {
  __typename?: "PostTagVoteType";
  author: UserType;
  id: Scalars["ID"]["output"];
  is_changed_my_mind: Scalars["Boolean"]["output"];
  is_vote_positive?: Maybe<Scalars["Boolean"]["output"]>;
};

export type PostToolType = PostTypeI & {
  __typename?: "PostToolType";
  alternatives: Array<PostToolType>;
  author: UserType;
  children: Array<PostTypeI>;
  company?: Maybe<DjangoModelType>;
  content: Scalars["String"]["output"];
  content_private: Scalars["String"]["output"];
  created_at: Scalars["DateTime"]["output"];
  crunchbase_url: Scalars["String"]["output"];
  domain: Scalars["String"]["output"];
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  parent?: Maybe<PostTypeI>;
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  seen_by_users: Array<DjangoModelType>;
  source: Scalars["String"]["output"];
  tag_votes: Array<PostTagVoteType>;
  tags: Array<PostTagType>;
  title: Scalars["String"]["output"];
  tool_type?: Maybe<ToolType>;
  type: PostTypeEnum;
  updated_at: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostVoteType>;
};

export type PostToolTypeAlternativesArgs = {
  filters?: InputMaybe<PostFilter>;
};

export type PostToolTypeTagsArgs = {
  filters?: InputMaybe<PostTagFilter>;
};

export type PostType = PostTypeI & {
  __typename?: "PostType";
  author: UserType;
  children: Array<PostTypeI>;
  company?: Maybe<DjangoModelType>;
  content: Scalars["String"]["output"];
  content_private: Scalars["String"]["output"];
  created_at: Scalars["DateTime"]["output"];
  crunchbase_url: Scalars["String"]["output"];
  domain: Scalars["String"]["output"];
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  parent?: Maybe<PostTypeI>;
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  seen_by_users: Array<DjangoModelType>;
  source: Scalars["String"]["output"];
  tag_votes: Array<PostTagVoteType>;
  tags: Array<PostTagType>;
  title: Scalars["String"]["output"];
  type: PostTypeEnum;
  updated_at: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostVoteType>;
};

export type PostTypeTagsArgs = {
  filters?: InputMaybe<PostTagFilter>;
};

export enum PostTypeEnum {
  Comment = "Comment",
  Post = "Post",
  Review = "Review",
  Tool = "Tool",
}

export type PostTypeEnumFilterLookup = {
  /** Case-sensitive containment test. Filter will be skipped on `null` value */
  contains?: InputMaybe<PostTypeEnum>;
  /** Case-sensitive ends-with. Filter will be skipped on `null` value */
  ends_with?: InputMaybe<PostTypeEnum>;
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<PostTypeEnum>;
  /** Case-insensitive containment test. Filter will be skipped on `null` value */
  i_contains?: InputMaybe<PostTypeEnum>;
  /** Case-insensitive ends-with. Filter will be skipped on `null` value */
  i_ends_with?: InputMaybe<PostTypeEnum>;
  /** Case-insensitive exact match. Filter will be skipped on `null` value */
  i_exact?: InputMaybe<PostTypeEnum>;
  /** Case-insensitive regular expression match. Filter will be skipped on `null` value */
  i_regex?: InputMaybe<PostTypeEnum>;
  /** Case-insensitive starts-with. Filter will be skipped on `null` value */
  i_starts_with?: InputMaybe<PostTypeEnum>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  in_list?: InputMaybe<Array<PostTypeEnum>>;
  /** Assignment test. Filter will be skipped on `null` value */
  is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** Case-sensitive regular expression match. Filter will be skipped on `null` value */
  regex?: InputMaybe<PostTypeEnum>;
  /** Case-sensitive starts-with. Filter will be skipped on `null` value */
  starts_with?: InputMaybe<PostTypeEnum>;
};

export type PostTypeI = {
  author: UserType;
  children: Array<PostTypeI>;
  company?: Maybe<DjangoModelType>;
  content: Scalars["String"]["output"];
  content_private: Scalars["String"]["output"];
  created_at: Scalars["DateTime"]["output"];
  crunchbase_url: Scalars["String"]["output"];
  domain: Scalars["String"]["output"];
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  parent?: Maybe<PostTypeI>;
  recommended_to_groups: Array<UserConnectionGroupType>;
  recommended_to_users: Array<UserType>;
  seen_by_users: Array<DjangoModelType>;
  source: Scalars["String"]["output"];
  tag_votes: Array<PostTagVoteType>;
  tags: Array<PostTagType>;
  title: Scalars["String"]["output"];
  type: PostTypeEnum;
  updated_at: Scalars["DateTime"]["output"];
  url: Scalars["String"]["output"];
  visibility: Visibility;
  visible_to_groups: Array<UserConnectionGroupType>;
  visible_to_users: Array<UserType>;
  votes: Array<PostVoteType>;
};

export type PostTypeITagsArgs = {
  filters?: InputMaybe<PostTagFilter>;
};

export type PostTypeInput = {
  alternatives?: InputMaybe<ManyToManyInput>;
  children?: InputMaybe<ManyToOneInput>;
  content?: InputMaybe<Scalars["String"]["input"]>;
  content_private?: InputMaybe<Scalars["String"]["input"]>;
  crunchbase_url?: InputMaybe<Scalars["String"]["input"]>;
  domain?: InputMaybe<Scalars["String"]["input"]>;
  github_url?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  parent?: InputMaybe<OneToManyInput>;
  recommended_to_groups?: InputMaybe<ManyToManyInput>;
  recommended_to_users?: InputMaybe<ManyToManyInput>;
  review_experience_hours?: InputMaybe<Scalars["Int"]["input"]>;
  review_importance?: InputMaybe<Scalars["Decimal"]["input"]>;
  review_rating?: InputMaybe<Scalars["Decimal"]["input"]>;
  review_usage_status?: InputMaybe<UsageStatus>;
  reviewed_at?: InputMaybe<Scalars["DateTime"]["input"]>;
  seen_by_users?: InputMaybe<ManyToManyInput>;
  source?: InputMaybe<Scalars["String"]["input"]>;
  tags?: InputMaybe<Array<PostTagTypeInput>>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  url?: InputMaybe<Scalars["String"]["input"]>;
  visibility?: InputMaybe<Visibility>;
  visible_to_groups?: InputMaybe<ManyToManyInput>;
  visible_to_users?: InputMaybe<ManyToManyInput>;
};

export type PostVoteType = {
  __typename?: "PostVoteType";
  author: UserType;
  id: Scalars["ID"]["output"];
  is_changed_my_mind?: Maybe<Scalars["Boolean"]["output"]>;
  is_vote_positive?: Maybe<Scalars["Boolean"]["output"]>;
  post: PostTypeI;
};

export type Query = {
  __typename?: "Query";
  post?: Maybe<PostType>;
  post_comment?: Maybe<PostCommentType>;
  post_comments: Array<PostCommentType>;
  post_review?: Maybe<PostReviewType>;
  post_reviews: Array<PostReviewType>;
  post_tool?: Maybe<PostToolType>;
  post_tools: Array<PostToolType>;
  posts: Array<PostType>;
  tags: Array<PostTagType>;
  user_current?: Maybe<UserType>;
};

export type QueryPostArgs = {
  pk: Scalars["ID"]["input"];
};

export type QueryPost_CommentArgs = {
  pk: Scalars["ID"]["input"];
};

export type QueryPost_CommentsArgs = {
  filters?: InputMaybe<PostFilter>;
};

export type QueryPost_ReviewArgs = {
  pk: Scalars["ID"]["input"];
};

export type QueryPost_ToolArgs = {
  pk: Scalars["ID"]["input"];
};

export type QueryPost_ToolsArgs = {
  filters?: InputMaybe<PostFilter>;
};

export type QueryPostsArgs = {
  filters?: InputMaybe<PostFilter>;
};

export type QueryTagsArgs = {
  filters?: InputMaybe<PostTagFilter>;
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

export enum ToolType {
  App = "App",
  Material = "Material",
  Other = "Other",
  Program = "Program",
  SaaS = "SaaS",
}

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

export enum UserListName {
  Library = "library",
  ReadLater = "read_later",
}

export type UserType = {
  __typename?: "UserType";
  avatar?: Maybe<DjangoFileType>;
  connection_groups: Array<UserConnectionGroupType>;
  email: Scalars["String"]["output"];
  first_name: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  last_name: Scalars["String"]["output"];
  library: Array<DjangoModelType>;
  post_tag_votes: Array<PostTagVoteType>;
  post_votes: Array<PostVoteType>;
  read_later: Array<DjangoModelType>;
  username: Scalars["String"]["output"];
};

export type UserTypeInput = {
  avatar?: InputMaybe<Scalars["Upload"]["input"]>;
  connection_groups?: InputMaybe<ManyToOneInput>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  library?: InputMaybe<ManyToManyInput>;
  read_later?: InputMaybe<ManyToManyInput>;
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
  pk: Scalars["ID"]["input"];
}>;

export type PostDetailQuery = {
  __typename?: "Query";
  post?:
    | ({ __typename?: "PostType" } & {
        " $fragmentRefs"?: {
          PostDetailFragment_PostType_Fragment: PostDetailFragment_PostType_Fragment;
        };
      })
    | null;
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
  tags: Array<{
    __typename?: "PostTagType";
    id: string;
    name: string;
    tag_parent?: { __typename?: "PostTagType"; id: string; name: string } | null;
  }>;
};

export type PostToolAlternativesQueryQueryVariables = Exact<{
  name?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type PostToolAlternativesQueryQuery = {
  __typename?: "Query";
  post_tools: Array<{ __typename?: "PostToolType"; id: string; title: string }>;
};

export type CreatePostReviewMutationVariables = Exact<{
  input: PostTypeInput;
}>;

export type CreatePostReviewMutation = {
  __typename?: "Mutation";
  create_post: { __typename?: "UserType"; id: string };
};

export type PostReviewDetailQueryVariables = Exact<{
  pk: Scalars["ID"]["input"];
}>;

export type PostReviewDetailQuery = {
  __typename?: "Query";
  post_review?:
    | ({ __typename?: "PostReviewType" } & {
        " $fragmentRefs"?: {
          PostReviewDetailFragmentFragment: PostReviewDetailFragmentFragment;
        };
      })
    | null;
};

export type ReviewListQueryVariables = Exact<{ [key: string]: never }>;

export type ReviewListQuery = {
  __typename?: "Query";
  post_reviews: Array<
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
    library: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    read_later: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    post_votes: Array<{
      __typename?: "PostVoteType";
      id: string;
      is_vote_positive?: boolean | null;
      post:
        | { __typename?: "PostCommentType"; id: string; type: PostTypeEnum }
        | { __typename?: "PostReviewType"; id: string; type: PostTypeEnum }
        | { __typename?: "PostToolType"; id: string; type: PostTypeEnum }
        | { __typename?: "PostType"; id: string; type: PostTypeEnum };
    }>;
    post_tag_votes: Array<{
      __typename?: "PostTagVoteType";
      id: string;
      is_vote_positive?: boolean | null;
      is_changed_my_mind: boolean;
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

export type Update_User_ListMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  list_field_name: UserListName;
  is_added: Scalars["Boolean"]["input"];
}>;

export type Update_User_ListMutation = { __typename?: "Mutation"; update_user_list: boolean };

export type CreateOrUpdatePostVoteMutationVariables = Exact<{
  id: Scalars["ID"]["input"];
  isVotePositive?: InputMaybe<Scalars["Boolean"]["input"]>;
}>;

export type CreateOrUpdatePostVoteMutation = {
  __typename?: "Mutation";
  create_or_update_post_vote: boolean;
};

type PostFragment_PostCommentType_Fragment = {
  __typename: "PostCommentType";
  id: string;
  type: PostTypeEnum;
  title: string;
  content: string;
  source: string;
  crunchbase_url: string;
  github_url: string;
  url: string;
  domain: string;
  updated_at: any;
  author: {
    __typename?: "UserType";
    id: string;
    username: string;
    avatar?: { __typename?: "DjangoFileType"; url: string } | null;
  };
  votes: Array<{ __typename?: "PostVoteType"; id: string; is_vote_positive?: boolean | null }>;
  children: Array<{
    __typename?: "PostCommentType";
    id: string;
    type: PostTypeEnum;
    content: string;
    created_at: any;
    updated_at: any;
    author: { __typename?: "UserType"; id: string; username: string };
  }>;
  parent?: {
    __typename: "PostCommentType";
    id: string;
    title: string;
    tags: Array<
      { __typename?: "PostTagType" } & {
        " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
      }
    >;
  } | null;
  tags: Array<
    { __typename?: "PostTagType" } & {
      " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
    }
  >;
} & { " $fragmentName"?: "PostFragment_PostCommentType_Fragment" };

type PostFragment_PostReviewType_Fragment = {
  __typename: "PostReviewType";
  id: string;
  type: PostTypeEnum;
  title: string;
  content: string;
  source: string;
  crunchbase_url: string;
  github_url: string;
  url: string;
  domain: string;
  updated_at: any;
  author: {
    __typename?: "UserType";
    id: string;
    username: string;
    avatar?: { __typename?: "DjangoFileType"; url: string } | null;
  };
  votes: Array<{ __typename?: "PostVoteType"; id: string; is_vote_positive?: boolean | null }>;
  children: Array<
    | {
        __typename?: "PostCommentType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostReviewType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostToolType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
  >;
  parent?: {
    __typename: "PostToolType";
    id: string;
    title: string;
    tags: Array<
      { __typename?: "PostTagType" } & {
        " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
      }
    >;
  } | null;
  tags: Array<
    { __typename?: "PostTagType" } & {
      " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
    }
  >;
} & { " $fragmentName"?: "PostFragment_PostReviewType_Fragment" };

type PostFragment_PostToolType_Fragment = {
  __typename: "PostToolType";
  id: string;
  type: PostTypeEnum;
  title: string;
  content: string;
  source: string;
  crunchbase_url: string;
  github_url: string;
  url: string;
  domain: string;
  updated_at: any;
  author: {
    __typename?: "UserType";
    id: string;
    username: string;
    avatar?: { __typename?: "DjangoFileType"; url: string } | null;
  };
  votes: Array<{ __typename?: "PostVoteType"; id: string; is_vote_positive?: boolean | null }>;
  children: Array<
    | {
        __typename?: "PostCommentType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostReviewType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostToolType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
  >;
  parent?:
    | {
        __typename: "PostCommentType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | {
        __typename: "PostReviewType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | {
        __typename: "PostToolType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | {
        __typename: "PostType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | null;
  tags: Array<
    { __typename?: "PostTagType" } & {
      " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
    }
  >;
} & { " $fragmentName"?: "PostFragment_PostToolType_Fragment" };

type PostFragment_PostType_Fragment = {
  __typename: "PostType";
  id: string;
  type: PostTypeEnum;
  title: string;
  content: string;
  source: string;
  crunchbase_url: string;
  github_url: string;
  url: string;
  domain: string;
  updated_at: any;
  author: {
    __typename?: "UserType";
    id: string;
    username: string;
    avatar?: { __typename?: "DjangoFileType"; url: string } | null;
  };
  votes: Array<{ __typename?: "PostVoteType"; id: string; is_vote_positive?: boolean | null }>;
  children: Array<
    | {
        __typename?: "PostCommentType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostReviewType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostToolType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
    | {
        __typename?: "PostType";
        id: string;
        type: PostTypeEnum;
        content: string;
        created_at: any;
        updated_at: any;
        author: { __typename?: "UserType"; id: string; username: string };
      }
  >;
  parent?:
    | {
        __typename: "PostCommentType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | {
        __typename: "PostReviewType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | {
        __typename: "PostToolType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | {
        __typename: "PostType";
        id: string;
        title: string;
        tags: Array<
          { __typename?: "PostTagType" } & {
            " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
          }
        >;
      }
    | null;
  tags: Array<
    { __typename?: "PostTagType" } & {
      " $fragmentRefs"?: { PostTagFragmentFragment: PostTagFragmentFragment };
    }
  >;
} & { " $fragmentName"?: "PostFragment_PostType_Fragment" };

export type PostFragmentFragment =
  | PostFragment_PostCommentType_Fragment
  | PostFragment_PostReviewType_Fragment
  | PostFragment_PostToolType_Fragment
  | PostFragment_PostType_Fragment;

type PostCommentsFragment_PostCommentType_Fragment = {
  __typename?: "PostCommentType";
  children: Array<{
    __typename: "PostCommentType";
    id: string;
    type: PostTypeEnum;
    content: string;
    visibility: Visibility;
    created_at: any;
    updated_at: any;
    author: {
      __typename?: "UserType";
      id: string;
      username: string;
      avatar?: { __typename?: "DjangoFileType"; url: string } | null;
    };
    parent?: { __typename?: "PostCommentType"; id: string } | null;
  }>;
} & { " $fragmentName"?: "PostCommentsFragment_PostCommentType_Fragment" };

type PostCommentsFragment_PostReviewType_Fragment = {
  __typename?: "PostReviewType";
  children: Array<
    | {
        __typename: "PostCommentType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?: { __typename?: "PostCommentType"; id: string } | null;
      }
    | {
        __typename: "PostReviewType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?: { __typename?: "PostToolType"; id: string } | null;
      }
    | {
        __typename: "PostToolType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?:
          | { __typename?: "PostCommentType"; id: string }
          | { __typename?: "PostReviewType"; id: string }
          | { __typename?: "PostToolType"; id: string }
          | { __typename?: "PostType"; id: string }
          | null;
      }
    | {
        __typename: "PostType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?:
          | { __typename?: "PostCommentType"; id: string }
          | { __typename?: "PostReviewType"; id: string }
          | { __typename?: "PostToolType"; id: string }
          | { __typename?: "PostType"; id: string }
          | null;
      }
  >;
} & { " $fragmentName"?: "PostCommentsFragment_PostReviewType_Fragment" };

type PostCommentsFragment_PostToolType_Fragment = {
  __typename?: "PostToolType";
  children: Array<
    | {
        __typename: "PostCommentType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?: { __typename?: "PostCommentType"; id: string } | null;
      }
    | {
        __typename: "PostReviewType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?: { __typename?: "PostToolType"; id: string } | null;
      }
    | {
        __typename: "PostToolType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?:
          | { __typename?: "PostCommentType"; id: string }
          | { __typename?: "PostReviewType"; id: string }
          | { __typename?: "PostToolType"; id: string }
          | { __typename?: "PostType"; id: string }
          | null;
      }
    | {
        __typename: "PostType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?:
          | { __typename?: "PostCommentType"; id: string }
          | { __typename?: "PostReviewType"; id: string }
          | { __typename?: "PostToolType"; id: string }
          | { __typename?: "PostType"; id: string }
          | null;
      }
  >;
} & { " $fragmentName"?: "PostCommentsFragment_PostToolType_Fragment" };

type PostCommentsFragment_PostType_Fragment = {
  __typename?: "PostType";
  children: Array<
    | {
        __typename: "PostCommentType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?: { __typename?: "PostCommentType"; id: string } | null;
      }
    | {
        __typename: "PostReviewType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?: { __typename?: "PostToolType"; id: string } | null;
      }
    | {
        __typename: "PostToolType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?:
          | { __typename?: "PostCommentType"; id: string }
          | { __typename?: "PostReviewType"; id: string }
          | { __typename?: "PostToolType"; id: string }
          | { __typename?: "PostType"; id: string }
          | null;
      }
    | {
        __typename: "PostType";
        id: string;
        type: PostTypeEnum;
        content: string;
        visibility: Visibility;
        created_at: any;
        updated_at: any;
        author: {
          __typename?: "UserType";
          id: string;
          username: string;
          avatar?: { __typename?: "DjangoFileType"; url: string } | null;
        };
        parent?:
          | { __typename?: "PostCommentType"; id: string }
          | { __typename?: "PostReviewType"; id: string }
          | { __typename?: "PostToolType"; id: string }
          | { __typename?: "PostType"; id: string }
          | null;
      }
  >;
} & { " $fragmentName"?: "PostCommentsFragment_PostType_Fragment" };

export type PostCommentsFragmentFragment =
  | PostCommentsFragment_PostCommentType_Fragment
  | PostCommentsFragment_PostReviewType_Fragment
  | PostCommentsFragment_PostToolType_Fragment
  | PostCommentsFragment_PostType_Fragment;

type PostDetailFragment_PostCommentType_Fragment = ({ __typename?: "PostCommentType" } & {
  " $fragmentRefs"?: {
    PostFragment_PostCommentType_Fragment: PostFragment_PostCommentType_Fragment;
    PostCommentsFragment_PostCommentType_Fragment: PostCommentsFragment_PostCommentType_Fragment;
  };
}) & { " $fragmentName"?: "PostDetailFragment_PostCommentType_Fragment" };

type PostDetailFragment_PostReviewType_Fragment = ({ __typename?: "PostReviewType" } & {
  " $fragmentRefs"?: {
    PostFragment_PostReviewType_Fragment: PostFragment_PostReviewType_Fragment;
    PostCommentsFragment_PostReviewType_Fragment: PostCommentsFragment_PostReviewType_Fragment;
  };
}) & { " $fragmentName"?: "PostDetailFragment_PostReviewType_Fragment" };

type PostDetailFragment_PostToolType_Fragment = ({ __typename?: "PostToolType" } & {
  " $fragmentRefs"?: {
    PostFragment_PostToolType_Fragment: PostFragment_PostToolType_Fragment;
    PostCommentsFragment_PostToolType_Fragment: PostCommentsFragment_PostToolType_Fragment;
  };
}) & { " $fragmentName"?: "PostDetailFragment_PostToolType_Fragment" };

type PostDetailFragment_PostType_Fragment = ({ __typename?: "PostType" } & {
  " $fragmentRefs"?: {
    PostFragment_PostType_Fragment: PostFragment_PostType_Fragment;
    PostCommentsFragment_PostType_Fragment: PostCommentsFragment_PostType_Fragment;
  };
}) & { " $fragmentName"?: "PostDetailFragment_PostType_Fragment" };

export type PostDetailFragmentFragment =
  | PostDetailFragment_PostCommentType_Fragment
  | PostDetailFragment_PostReviewType_Fragment
  | PostDetailFragment_PostToolType_Fragment
  | PostDetailFragment_PostType_Fragment;

export type PostReviewFragmentFragment = ({
  __typename?: "PostReviewType";
  review_importance?: any | null;
  review_usage_status?: UsageStatus | null;
  review_rating?: any | null;
  review_experience_hours?: number | null;
  reviewed_at: any;
} & {
  " $fragmentRefs"?: {
    PostFragment_PostReviewType_Fragment: PostFragment_PostReviewType_Fragment;
  };
}) & { " $fragmentName"?: "PostReviewFragmentFragment" };

export type PostReviewDetailFragmentFragment = ({ __typename?: "PostReviewType" } & {
  " $fragmentRefs"?: {
    PostReviewFragmentFragment: PostReviewFragmentFragment;
    PostCommentsFragment_PostReviewType_Fragment: PostCommentsFragment_PostReviewType_Fragment;
  };
}) & { " $fragmentName"?: "PostReviewDetailFragmentFragment" };

export type PostTagFragmentFragment = {
  __typename?: "PostTagType";
  id: string;
  name: string;
  description: string;
  is_important?: boolean | null;
  votes: Array<{
    __typename?: "PostTagVoteType";
    id: string;
    is_vote_positive?: boolean | null;
    author: { __typename?: "UserType"; id: string; username: string };
  }>;
  tag_parent?: { __typename?: "PostTagType"; id: string; name: string } | null;
  author: { __typename?: "UserType"; id: string; username: string };
} & { " $fragmentName"?: "PostTagFragmentFragment" };

export const PostTagFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostTagFragmentFragment, unknown>;
export const PostFragmentFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
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
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
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
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
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
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
          { kind: "Field", name: { kind: "Name", value: "review_importance" } },
          { kind: "Field", name: { kind: "Name", value: "review_usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "review_rating" } },
          { kind: "Field", name: { kind: "Name", value: "review_experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
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
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
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
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
          { kind: "Field", name: { kind: "Name", value: "review_importance" } },
          { kind: "Field", name: { kind: "Name", value: "review_usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "review_rating" } },
          { kind: "Field", name: { kind: "Name", value: "review_experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
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
          variable: { kind: "Variable", name: { kind: "Name", value: "pk" } },
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
                name: { kind: "Name", value: "pk" },
                value: { kind: "Variable", name: { kind: "Name", value: "pk" } },
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
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostDetailFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
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
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "type" },
                      value: {
                        kind: "ObjectValue",
                        fields: [
                          {
                            kind: "ObjectField",
                            name: { kind: "Name", value: "exact" },
                            value: { kind: "EnumValue", value: "Post" },
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
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
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
            name: { kind: "Name", value: "tags" },
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
export const PostToolAlternativesQueryDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "PostToolAlternativesQuery" },
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
            name: { kind: "Name", value: "post_tools" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "filters" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "title" },
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
                { kind: "Field", name: { kind: "Name", value: "title" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PostToolAlternativesQueryQuery,
  PostToolAlternativesQueryQueryVariables
>;
export const CreatePostReviewDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreatePostReview" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "input" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "PostTypeInput" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "create_post" },
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
} as unknown as DocumentNode<CreatePostReviewMutation, CreatePostReviewMutationVariables>;
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
          variable: { kind: "Variable", name: { kind: "Name", value: "pk" } },
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
            name: { kind: "Name", value: "post_review" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "pk" },
                value: { kind: "Variable", name: { kind: "Name", value: "pk" } },
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
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
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
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
          { kind: "Field", name: { kind: "Name", value: "review_importance" } },
          { kind: "Field", name: { kind: "Name", value: "review_usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "review_rating" } },
          { kind: "Field", name: { kind: "Name", value: "review_experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostCommentsFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
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
                  name: { kind: "Name", value: "parent" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "id" } }],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "visibility" } },
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
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
            name: { kind: "Name", value: "post_reviews" },
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
      name: { kind: "Name", value: "PostTagFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTagType" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "votes" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
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
              ],
            },
          },
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
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "PostFragment" },
      typeCondition: { kind: "NamedType", name: { kind: "Name", value: "PostTypeI" } },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "id" } },
          { kind: "Field", name: { kind: "Name", value: "__typename" } },
          { kind: "Field", name: { kind: "Name", value: "type" } },
          { kind: "Field", name: { kind: "Name", value: "title" } },
          { kind: "Field", name: { kind: "Name", value: "content" } },
          { kind: "Field", name: { kind: "Name", value: "source" } },
          { kind: "Field", name: { kind: "Name", value: "crunchbase_url" } },
          { kind: "Field", name: { kind: "Name", value: "github_url" } },
          { kind: "Field", name: { kind: "Name", value: "url" } },
          { kind: "Field", name: { kind: "Name", value: "domain" } },
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
            name: { kind: "Name", value: "children" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "type" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
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
                { kind: "Field", name: { kind: "Name", value: "created_at" } },
                { kind: "Field", name: { kind: "Name", value: "updated_at" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "parent" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "__typename" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "tags" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "PostTagFragment" },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { kind: "Field", name: { kind: "Name", value: "updated_at" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "tags" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "FragmentSpread", name: { kind: "Name", value: "PostTagFragment" } },
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
          { kind: "FragmentSpread", name: { kind: "Name", value: "PostFragment" } },
          { kind: "Field", name: { kind: "Name", value: "review_importance" } },
          { kind: "Field", name: { kind: "Name", value: "review_usage_status" } },
          { kind: "Field", name: { kind: "Name", value: "review_rating" } },
          { kind: "Field", name: { kind: "Name", value: "review_experience_hours" } },
          { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
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
                  name: { kind: "Name", value: "library" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "read_later" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
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
                          selections: [
                            { kind: "Field", name: { kind: "Name", value: "id" } },
                            { kind: "Field", name: { kind: "Name", value: "type" } },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "post_tag_votes" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "is_vote_positive" } },
                      { kind: "Field", name: { kind: "Name", value: "is_changed_my_mind" } },
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
export const Update_User_ListDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "update_user_list" },
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
            type: { kind: "NamedType", name: { kind: "Name", value: "UserListName" } },
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
            name: { kind: "Name", value: "update_user_list" },
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
} as unknown as DocumentNode<Update_User_ListMutation, Update_User_ListMutationVariables>;
export const CreateOrUpdatePostVoteDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateOrUpdatePostVote" },
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
            name: { kind: "Name", value: "create_or_update_post_vote" },
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
} as unknown as DocumentNode<
  CreateOrUpdatePostVoteMutation,
  CreateOrUpdatePostVoteMutationVariables
>;
