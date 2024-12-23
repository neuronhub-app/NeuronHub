/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
	Boolean: unknown;
	DjangoModelType: {
		kind: "OBJECT";
		name: "DjangoModelType";
		fields: {
			pk: {
				name: "pk";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
				};
			};
		};
	};
	ID: unknown;
	Mutation: {
		kind: "OBJECT";
		name: "Mutation";
		fields: {
			logout: {
				name: "logout";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null };
				};
			};
			update_user: {
				name: "update_user";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
				};
			};
		};
	};
	OneToManyInput: {
		kind: "INPUT_OBJECT";
		name: "OneToManyInput";
		isOneOf: false;
		inputFields: [
			{
				name: "set";
				type: { kind: "SCALAR"; name: "ID"; ofType: null };
				defaultValue: null;
			},
		];
	};
	Query: {
		kind: "OBJECT";
		name: "Query";
		fields: {
			tool: {
				name: "tool";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "OBJECT"; name: "ToolType"; ofType: null };
				};
			};
			tools: {
				name: "tools";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: {
						kind: "LIST";
						name: never;
						ofType: {
							kind: "NON_NULL";
							name: never;
							ofType: { kind: "OBJECT"; name: "ToolType"; ofType: null };
						};
					};
				};
			};
			user_current: {
				name: "user_current";
				type: { kind: "OBJECT"; name: "UserType"; ofType: null };
			};
		};
	};
	String: unknown;
	ToolType: {
		kind: "OBJECT";
		name: "ToolType";
		fields: {
			alternatives: {
				name: "alternatives";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: {
						kind: "LIST";
						name: never;
						ofType: {
							kind: "NON_NULL";
							name: never;
							ofType: { kind: "OBJECT"; name: "ToolType"; ofType: null };
						};
					};
				};
			};
			crunchbase_url: {
				name: "crunchbase_url";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
			description: {
				name: "description";
				type: { kind: "SCALAR"; name: "String"; ofType: null };
			};
			domain: {
				name: "domain";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
			github_url: {
				name: "github_url";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
			id: {
				name: "id";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
				};
			};
			name: {
				name: "name";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
			slug: {
				name: "slug";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
		};
	};
	UserType: {
		kind: "OBJECT";
		name: "UserType";
		fields: {
			email: {
				name: "email";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
			first_name: {
				name: "first_name";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
			id: {
				name: "id";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
				};
			};
			last_name: {
				name: "last_name";
				type: {
					kind: "NON_NULL";
					name: never;
					ofType: { kind: "SCALAR"; name: "String"; ofType: null };
				};
			};
			org: {
				name: "org";
				type: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
			};
		};
	};
	UserTypeInput: {
		kind: "INPUT_OBJECT";
		name: "UserTypeInput";
		isOneOf: false;
		inputFields: [
			{
				name: "id";
				type: { kind: "SCALAR"; name: "ID"; ofType: null };
				defaultValue: null;
			},
			{
				name: "email";
				type: { kind: "SCALAR"; name: "String"; ofType: null };
				defaultValue: null;
			},
			{
				name: "first_name";
				type: { kind: "SCALAR"; name: "String"; ofType: null };
				defaultValue: null;
			},
			{
				name: "last_name";
				type: { kind: "SCALAR"; name: "String"; ofType: null };
				defaultValue: null;
			},
			{
				name: "org";
				type: { kind: "INPUT_OBJECT"; name: "OneToManyInput"; ofType: null };
				defaultValue: null;
			},
		];
	};
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
	name: never;
	query: "Query";
	mutation: "Mutation";
	subscription: never;
	types: introspection_types;
};

declare module "gql.tada" {
	interface setupSchema {
		introspection: introspection;
	}
}
