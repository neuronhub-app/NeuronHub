/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
  Boolean: unknown;
  DateTime: unknown;
  ID: unknown;
  IDBaseFilterLookup: {
    kind: "INPUT_OBJECT";
    name: "IDBaseFilterLookup";
    isOneOf: false;
    inputFields: [
      {
        name: "exact";
        type: { kind: "SCALAR"; name: "ID"; ofType: null };
        defaultValue: null;
      },
      {
        name: "is_null";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
      {
        name: "in_list";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
          };
        };
        defaultValue: null;
      },
    ];
  };
  Importance: {
    name: "Importance";
    enumValues: "EXTRA_LOW" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  };
  Int: unknown;
  ManyToManyInput: {
    kind: "INPUT_OBJECT";
    name: "ManyToManyInput";
    isOneOf: false;
    inputFields: [
      {
        name: "add";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
          };
        };
        defaultValue: null;
      },
      {
        name: "remove";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
          };
        };
        defaultValue: null;
      },
      {
        name: "set";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
          };
        };
        defaultValue: null;
      },
    ];
  };
  ManyToOneInput: {
    kind: "INPUT_OBJECT";
    name: "ManyToOneInput";
    isOneOf: false;
    inputFields: [
      {
        name: "add";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
          };
        };
        defaultValue: null;
      },
      {
        name: "remove";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
          };
        };
        defaultValue: null;
      },
      {
        name: "set";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
          };
        };
        defaultValue: null;
      },
    ];
  };
  Mutation: {
    kind: "OBJECT";
    name: "Mutation";
    fields: {
      create_review: {
        name: "create_review";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
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
      tool_tags: {
        name: "tool_tags";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ToolTagType"; ofType: null };
            };
          };
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
  StrFilterLookup: {
    kind: "INPUT_OBJECT";
    name: "StrFilterLookup";
    isOneOf: false;
    inputFields: [
      {
        name: "exact";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "is_null";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
      {
        name: "in_list";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "SCALAR"; name: "String"; ofType: null };
          };
        };
        defaultValue: null;
      },
      {
        name: "i_exact";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "contains";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "i_contains";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "i_starts_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "ends_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "i_ends_with";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "regex";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "i_regex";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
    ];
  };
  String: unknown;
  ToolAlternative: {
    kind: "INPUT_OBJECT";
    name: "ToolAlternative";
    isOneOf: false;
    inputFields: [
      {
        name: "is_vote_positive";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
      {
        name: "tool_alternative";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "INPUT_OBJECT";
            name: "OneToManyInput";
            ofType: null;
          };
        };
        defaultValue: null;
      },
      {
        name: "comment";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
    ];
  };
  ToolFilter: {
    kind: "INPUT_OBJECT";
    name: "ToolFilter";
    isOneOf: false;
    inputFields: [
      {
        name: "id";
        type: {
          kind: "INPUT_OBJECT";
          name: "IDBaseFilterLookup";
          ofType: null;
        };
        defaultValue: null;
      },
      {
        name: "name";
        type: { kind: "INPUT_OBJECT"; name: "StrFilterLookup"; ofType: null };
        defaultValue: null;
      },
      {
        name: "description";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "AND";
        type: { kind: "INPUT_OBJECT"; name: "ToolFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "OR";
        type: { kind: "INPUT_OBJECT"; name: "ToolFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "NOT";
        type: { kind: "INPUT_OBJECT"; name: "ToolFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "DISTINCT";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
    ];
  };
  ToolReviewTypeInput: {
    kind: "INPUT_OBJECT";
    name: "ToolReviewTypeInput";
    isOneOf: false;
    inputFields: [
      {
        name: "id";
        type: { kind: "SCALAR"; name: "ID"; ofType: null };
        defaultValue: null;
      },
      {
        name: "tool";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "INPUT_OBJECT"; name: "ToolTypeInput"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "title";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "content";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "content_private";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "usage_status";
        type: { kind: "ENUM"; name: "UsageStatus"; ofType: null };
        defaultValue: null;
      },
      {
        name: "source";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "reviewed_at";
        type: { kind: "SCALAR"; name: "DateTime"; ofType: null };
        defaultValue: null;
      },
      {
        name: "rating";
        type: { kind: "SCALAR"; name: "Int"; ofType: null };
        defaultValue: null;
      },
      {
        name: "importance";
        type: { kind: "ENUM"; name: "Importance"; ofType: null };
        defaultValue: null;
      },
      {
        name: "visibility";
        type: { kind: "ENUM"; name: "Visibility"; ofType: null };
        defaultValue: null;
      },
      {
        name: "visible_to_users";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "visible_to_groups";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "recommended_to_users";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "recommended_to_groups";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "is_review_later";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
      {
        name: "tags";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "INPUT_OBJECT";
              name: "ToolTagTypeInput";
              ofType: null;
            };
          };
        };
        defaultValue: null;
      },
    ];
  };
  ToolTagFilter: {
    kind: "INPUT_OBJECT";
    name: "ToolTagFilter";
    isOneOf: false;
    inputFields: [
      {
        name: "id";
        type: {
          kind: "INPUT_OBJECT";
          name: "IDBaseFilterLookup";
          ofType: null;
        };
        defaultValue: null;
      },
      {
        name: "name";
        type: { kind: "INPUT_OBJECT"; name: "StrFilterLookup"; ofType: null };
        defaultValue: null;
      },
      {
        name: "description";
        type: { kind: "INPUT_OBJECT"; name: "StrFilterLookup"; ofType: null };
        defaultValue: null;
      },
      {
        name: "AND";
        type: { kind: "INPUT_OBJECT"; name: "ToolTagFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "OR";
        type: { kind: "INPUT_OBJECT"; name: "ToolTagFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "NOT";
        type: { kind: "INPUT_OBJECT"; name: "ToolTagFilter"; ofType: null };
        defaultValue: null;
      },
      {
        name: "DISTINCT";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
    ];
  };
  ToolTagType: {
    kind: "OBJECT";
    name: "ToolTagType";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
      description: {
        name: "description";
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
      tag_children: {
        name: "tag_children";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ToolTagType"; ofType: null };
            };
          };
        };
      };
      tag_parent: {
        name: "tag_parent";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "ToolTagType"; ofType: null };
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
    };
  };
  ToolTagTypeInput: {
    kind: "INPUT_OBJECT";
    name: "ToolTagTypeInput";
    isOneOf: false;
    inputFields: [
      {
        name: "id";
        type: { kind: "SCALAR"; name: "ID"; ofType: null };
        defaultValue: null;
      },
      {
        name: "name";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "description";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "comment";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "is_vote_positive";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
    ];
  };
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
        type: { kind: "SCALAR"; name: "String"; ofType: null };
      };
    };
  };
  ToolTypeInput: {
    kind: "INPUT_OBJECT";
    name: "ToolTypeInput";
    isOneOf: false;
    inputFields: [
      {
        name: "name";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "description";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "github_url";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "crunchbase_url";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "domain";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "alternatives";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: {
              kind: "INPUT_OBJECT";
              name: "ToolAlternative";
              ofType: null;
            };
          };
        };
        defaultValue: null;
      },
    ];
  };
  UsageStatus: {
    name: "UsageStatus";
    enumValues:
      | "USING"
      | "USED"
      | "WANT_TO_USE"
      | "INTERESTED"
      | "NOT_INTERESTED";
  };
  UserConnectionGroupType: {
    kind: "OBJECT";
    name: "UserConnectionGroupType";
    fields: {
      connections: {
        name: "connections";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
            };
          };
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
    };
  };
  UserType: {
    kind: "OBJECT";
    name: "UserType";
    fields: {
      connection_groups: {
        name: "connection_groups";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: {
                kind: "OBJECT";
                name: "UserConnectionGroupType";
                ofType: null;
              };
            };
          };
        };
      };
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
      name: {
        name: "name";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
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
        name: "name";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "email";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "connection_groups";
        type: { kind: "INPUT_OBJECT"; name: "ManyToOneInput"; ofType: null };
        defaultValue: null;
      },
    ];
  };
  Visibility: {
    name: "Visibility";
    enumValues:
      | "PRIVATE"
      | "CONNECTION_GROUPS"
      | "CONNECTIONS"
      | "INTERNAL"
      | "PUBLIC";
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
