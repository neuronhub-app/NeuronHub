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
  create_review: UserType;
  logout: Scalars["Boolean"]["output"];
  toggle_user_review_list: Scalars["Boolean"]["output"];
  update_user: UserType;
};

export type MutationCreate_ReviewArgs = {
  data: ToolReviewTypeInput;
};

export type MutationToggle_User_Review_ListArgs = {
  is_added: Scalars["Boolean"]["input"];
  review_list_name: UserReviewListName;
  review_pk: Scalars["ID"]["input"];
};

export type MutationUpdate_UserArgs = {
  data: UserTypeInput;
};

export type OneToManyInput = {
  set?: InputMaybe<Scalars["ID"]["input"]>;
};

export type Query = {
  __typename?: "Query";
  me: UserType;
  tool: ToolType;
  tool_reviews: Array<ToolReviewType>;
  tool_tags: Array<ToolTagType>;
  tools: Array<ToolType>;
  user_current?: Maybe<UserType>;
};

export type QueryToolArgs = {
  pk: Scalars["ID"]["input"];
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
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<IdBaseFilterLookup>;
  name?: InputMaybe<StrFilterLookup>;
};

export type ToolReviewType = {
  __typename?: "ToolReviewType";
  author: UserType;
  content: Scalars["String"]["output"];
  content_cons: Scalars["String"]["output"];
  content_pros: Scalars["String"]["output"];
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
  tag_parent: ToolTagType;
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
  description?: Maybe<Scalars["String"]["output"]>;
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  slug?: Maybe<Scalars["String"]["output"]>;
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

export enum UserReviewListName {
  ReviewsLibrary = "REVIEWS_LIBRARY",
  ReviewsReadLater = "REVIEWS_READ_LATER",
  ReviewsStarred = "REVIEWS_STARRED",
}

export type UserType = {
  __typename?: "UserType";
  avatar?: Maybe<DjangoFileType>;
  connection_groups: Array<UserConnectionGroupType>;
  email: Scalars["String"]["output"];
  first_name: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  last_name: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  reviews_library: Array<DjangoModelType>;
  reviews_read_later: Array<DjangoModelType>;
  reviews_starred: Array<DjangoModelType>;
};

export type UserTypeInput = {
  avatar?: InputMaybe<Scalars["Upload"]["input"]>;
  connection_groups?: InputMaybe<ManyToOneInput>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  reviews_library?: InputMaybe<ManyToManyInput>;
  reviews_read_later?: InputMaybe<ManyToManyInput>;
  reviews_starred?: InputMaybe<ManyToManyInput>;
};

export enum Visibility {
  Connections = "CONNECTIONS",
  ConnectionGroups = "CONNECTION_GROUPS",
  Internal = "INTERNAL",
  Private = "PRIVATE",
  Public = "PUBLIC",
}

export type ToolTagsQueryQueryVariables = Exact<{
  name?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ToolTagsQueryQuery = {
  __typename?: "Query";
  tool_tags: Array<{ __typename?: "ToolTagType"; id: string; name: string }>;
};

export type ToolAlternativesQueryQueryVariables = Exact<{
  name?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ToolAlternativesQueryQuery = {
  __typename?: "Query";
  tools: Array<{ __typename?: "ToolType"; id: string; name: string }>;
};

export type AddToListReadLaterMutationVariables = Exact<{
  reviewId: Scalars["ID"]["input"];
  reviewListName: UserReviewListName;
  isAdded: Scalars["Boolean"]["input"];
}>;

export type AddToListReadLaterMutation = {
  __typename?: "Mutation";
  toggle_user_review_list: boolean;
};

export type ReviewListQueryVariables = Exact<{ [key: string]: never }>;

export type ReviewListQuery = {
  __typename?: "Query";
  tool_reviews: Array<{
    __typename?: "ToolReviewType";
    id: string;
    title: string;
    content: string;
    content_pros: string;
    content_cons: string;
    importance?: any | null;
    is_private: boolean;
    is_review_later: boolean;
    usage_status?: UsageStatus | null;
    rating?: any | null;
    source: string;
    reviewed_at: any;
    experience_hours?: number | null;
    author: {
      __typename?: "UserType";
      id: string;
      name: string;
      avatar?: { __typename?: "DjangoFileType"; url: string } | null;
    };
    tool: {
      __typename?: "ToolType";
      id: string;
      name: string;
      tags: Array<{
        __typename?: "ToolTagType";
        id: string;
        name: string;
        description: string;
        is_important: boolean;
        tag_parent: { __typename?: "ToolTagType"; id: string; name: string };
        author: { __typename?: "UserType"; id: string; name: string };
        votes: Array<{
          __typename?: "ToolTagVoteType";
          id: string;
          is_vote_positive?: boolean | null;
          author: { __typename?: "UserType"; id: string; name: string };
        }>;
      }>;
    };
  }>;
};

export type CreateReviewMutationVariables = Exact<{
  input: ToolReviewTypeInput;
}>;

export type CreateReviewMutation = {
  __typename?: "Mutation";
  create_review: { __typename?: "UserType"; id: string };
};

export type UserCurrentQueryVariables = Exact<{ [key: string]: never }>;

export type UserCurrentQuery = {
  __typename?: "Query";
  user_current?: {
    __typename?: "UserType";
    id: string;
    name: string;
    email: string;
    reviews_library: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    reviews_read_later: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    reviews_starred: Array<{ __typename?: "DjangoModelType"; pk: string }>;
    connection_groups: Array<{
      __typename?: "UserConnectionGroupType";
      id: string;
      name: string;
      connections: Array<{ __typename?: "UserType"; id: string; name: string }>;
    }>;
  } | null;
};

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
export const AddToListReadLaterDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "AddToListReadLater" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewId" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "reviewListName" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "UserReviewListName" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "isAdded" } },
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
            name: { kind: "Name", value: "toggle_user_review_list" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "review_pk" },
                value: { kind: "Variable", name: { kind: "Name", value: "reviewId" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "review_list_name" },
                value: { kind: "Variable", name: { kind: "Name", value: "reviewListName" } },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "is_added" },
                value: { kind: "Variable", name: { kind: "Name", value: "isAdded" } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddToListReadLaterMutation, AddToListReadLaterMutationVariables>;
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
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "content" } },
                { kind: "Field", name: { kind: "Name", value: "content_pros" } },
                { kind: "Field", name: { kind: "Name", value: "content_cons" } },
                { kind: "Field", name: { kind: "Name", value: "importance" } },
                { kind: "Field", name: { kind: "Name", value: "is_private" } },
                { kind: "Field", name: { kind: "Name", value: "is_review_later" } },
                { kind: "Field", name: { kind: "Name", value: "usage_status" } },
                { kind: "Field", name: { kind: "Name", value: "rating" } },
                { kind: "Field", name: { kind: "Name", value: "source" } },
                { kind: "Field", name: { kind: "Name", value: "reviewed_at" } },
                { kind: "Field", name: { kind: "Name", value: "experience_hours" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "author" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
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
                  name: { kind: "Name", value: "tool" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "name" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "tags" },
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
                                  { kind: "Field", name: { kind: "Name", value: "name" } },
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
                                        { kind: "Field", name: { kind: "Name", value: "name" } },
                                      ],
                                    },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "is_vote_positive" },
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
      },
    },
  ],
} as unknown as DocumentNode<ReviewListQuery, ReviewListQueryVariables>;
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
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "reviews_library" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "reviews_read_later" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "reviews_starred" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [{ kind: "Field", name: { kind: "Name", value: "pk" } }],
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
      },
    },
  ],
} as unknown as DocumentNode<UserCurrentQuery, UserCurrentQueryVariables>;
