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

export type Mutation = {
	__typename?: "Mutation";
	logout: Scalars["Boolean"]["output"];
	update_user: UserType;
};

export type MutationUpdate_UserArgs = {
	data: UserTypeInput;
};

export type OneToManyInput = {
	set?: InputMaybe<Scalars["ID"]["input"]>;
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

export type ToolTagFilter = {
	AND?: InputMaybe<ToolTagFilter>;
	DISTINCT?: InputMaybe<Scalars["Boolean"]["input"]>;
	NOT?: InputMaybe<ToolTagFilter>;
	OR?: InputMaybe<ToolTagFilter>;
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

export type UserType = {
	__typename?: "UserType";
	email: Scalars["String"]["output"];
	first_name: Scalars["String"]["output"];
	id: Scalars["ID"]["output"];
	last_name: Scalars["String"]["output"];
	org?: Maybe<DjangoModelType>;
};

export type UserTypeInput = {
	email?: InputMaybe<Scalars["String"]["input"]>;
	first_name?: InputMaybe<Scalars["String"]["input"]>;
	id?: InputMaybe<Scalars["ID"]["input"]>;
	last_name?: InputMaybe<Scalars["String"]["input"]>;
	org?: InputMaybe<OneToManyInput>;
};

export type UserCurrentQueryVariables = Exact<{ [key: string]: never }>;

export type UserCurrentQuery = {
	__typename?: "Query";
	user_current?: {
		__typename?: "UserType";
		id: string;
		first_name: string;
	} | null;
};

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
							],
						},
					},
				],
			},
		},
	],
} as unknown as DocumentNode<UserCurrentQuery, UserCurrentQueryVariables>;
