/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
  Boolean: unknown;
  Decimal: unknown;
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
  ToolReviewDraftAlternative: {
    kind: "INPUT_OBJECT";
    name: "ToolReviewDraftAlternative";
    isOneOf: false;
    inputFields: [
      {
        name: "tool_id";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "tool_alternative_id";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "is_vote_positive";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        };
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
        name: "shared_user_ids";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
            };
          };
        };
        defaultValue: null;
      },
      {
        name: "shared_org_ids";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
            };
          };
        };
        defaultValue: null;
      },
      {
        name: "rating";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Decimal"; ofType: null };
        };
        defaultValue: null;
      },
      {
        name: "is_private";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        defaultValue: null;
      },
      {
        name: "tags";
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
                kind: "INPUT_OBJECT";
                name: "ToolTagTypeInput";
                ofType: null;
              };
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
        type: { kind: "SCALAR"; name: "String"; ofType: null };
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
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
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
              name: "ToolReviewDraftAlternative";
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
