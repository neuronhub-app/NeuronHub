/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Decimal (fixed-point) */
  Decimal: { input: any; output: any };
};

export type IdBaseFilterLookup = {
  /** Exact match. Filter will be skipped on `null` value */
  exact?: InputMaybe<Scalars["ID"]["input"]>;
  /** Exact match of items in a given list. Filter will be skipped on `null` value */
  in_list?: InputMaybe<Array<Scalars["ID"]["input"]>>;
  /** Assignment test. Filter will be skipped on `null` value */
  is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  update_user: UserType;
};

export type MutationCreate_ReviewArgs = {
  data: ToolReviewTypeInput;
};

export type MutationUpdate_UserArgs = {
  data: UserTypeInput;
};

export type Query = {
  __typename?: "Query";
  tool: ToolType;
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

export type ToolReviewDraftAlternative = {
  is_vote_positive: Scalars["Boolean"]["input"];
  tool_alternative_id: Scalars["ID"]["input"];
  tool_id: Scalars["ID"]["input"];
};

export type ToolReviewTypeInput = {
  content?: InputMaybe<Scalars["String"]["input"]>;
  content_private?: InputMaybe<Scalars["String"]["input"]>;
  is_private?: InputMaybe<Scalars["Boolean"]["input"]>;
  rating: Scalars["Decimal"]["input"];
  shared_org_ids: Array<Scalars["ID"]["input"]>;
  shared_user_ids: Array<Scalars["ID"]["input"]>;
  tags: Array<ToolTagTypeInput>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  tool: ToolTypeInput;
  usage_status?: InputMaybe<UsageStatus>;
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
  name: Scalars["String"]["output"];
  tag_children: Array<ToolTagType>;
  tag_parent: ToolTagType;
  tools: Array<ToolType>;
};

export type ToolTagTypeTag_ChildrenArgs = {
  filters?: InputMaybe<ToolTagFilter>;
};

export type ToolTagTypeInput = {
  comment?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  is_vote_positive?: InputMaybe<Scalars["Boolean"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
};

export type ToolType = {
  __typename?: "ToolType";
  alternatives: Array<ToolType>;
  crunchbase_url: Scalars["String"]["output"];
  description?: Maybe<Scalars["String"]["output"]>;
  domain: Scalars["String"]["output"];
  github_url: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  slug: Scalars["String"]["output"];
};

export type ToolTypeInput = {
  alternatives?: InputMaybe<Array<ToolReviewDraftAlternative>>;
  crunchbase_url?: InputMaybe<Scalars["String"]["input"]>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  domain?: InputMaybe<Scalars["String"]["input"]>;
  github_url?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
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
  connection_groups: Array<UserConnectionGroupType>;
  email: Scalars["String"]["output"];
  first_name: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  last_name: Scalars["String"]["output"];
};

export type UserTypeInput = {
  connection_groups?: InputMaybe<ManyToOneInput>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  first_name?: InputMaybe<Scalars["String"]["input"]>;
  id?: InputMaybe<Scalars["ID"]["input"]>;
  last_name?: InputMaybe<Scalars["String"]["input"]>;
};

export type ToolTagsQueryQueryVariables = Exact<{
  name?: InputMaybe<Scalars["String"]["input"]>;
}>;

export type ToolTagsQueryQuery = {
  __typename?: "Query";
  tool_tags: Array<{ __typename?: "ToolTagType"; id: string; name: string }>;
};

export type UserCurrentQueryVariables = Exact<{ [key: string]: never }>;

export type UserCurrentQuery = {
  __typename?: "Query";
  user_current?: {
    __typename?: "UserType";
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    connection_groups: Array<{
      __typename?: "UserConnectionGroupType";
      id: string;
      name: string;
      connections: Array<{
        __typename?: "UserType";
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      }>;
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
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "name" },
                            },
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
                            value: {
                              kind: "Variable",
                              name: { kind: "Name", value: "name" },
                            },
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
                { kind: "Field", name: { kind: "Name", value: "first_name" } },
                { kind: "Field", name: { kind: "Name", value: "last_name" } },
                { kind: "Field", name: { kind: "Name", value: "email" } },
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
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "first_name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "last_name" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "email" },
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
