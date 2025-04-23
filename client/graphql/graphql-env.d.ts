/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
  Boolean: unknown;
  CommentType: {
    kind: "OBJECT";
    name: "CommentType";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
      content: {
        name: "content";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      created_at: {
        name: "created_at";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null };
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
      parent: { name: "parent"; type: { kind: "OBJECT"; name: "CommentType"; ofType: null } };
      seen_by_users: {
        name: "seen_by_users";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      updated_at: {
        name: "updated_at";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null };
        };
      };
      visibility: {
        name: "visibility";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "ENUM"; name: "Visibility"; ofType: null };
        };
      };
    };
  };
  DateTime: unknown;
  Decimal: unknown;
  DjangoFileType: {
    kind: "OBJECT";
    name: "DjangoFileType";
    fields: {
      name: {
        name: "name";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      path: {
        name: "path";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      size: {
        name: "size";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Int"; ofType: null };
        };
      };
      url: {
        name: "url";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
    };
  };
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
      { name: "exact"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
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
  Int: unknown;
  ListFieldName: {
    name: "ListFieldName";
    enumValues: "read_later_posts" | "read_later_reviews" | "library_posts" | "library_reviews";
  };
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
      create_post: {
        name: "create_post";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
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
      mutate_user_list: {
        name: "mutate_user_list";
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
      vote_post: {
        name: "vote_post";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        };
      };
      vote_review: {
        name: "vote_review";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        };
      };
    };
  };
  OneToManyInput: {
    kind: "INPUT_OBJECT";
    name: "OneToManyInput";
    isOneOf: false;
    inputFields: [
      { name: "set"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
    ];
  };
  PostInterface: {
    kind: "INTERFACE";
    name: "PostInterface";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
      comments: {
        name: "comments";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "CommentType"; ofType: null };
            };
          };
        };
      };
      content: {
        name: "content";
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
      recommended_to_groups: {
        name: "recommended_to_groups";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "UserConnectionGroupType"; ofType: null };
            };
          };
        };
      };
      recommended_to_users: {
        name: "recommended_to_users";
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
      source: {
        name: "source";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      title: {
        name: "title";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      tool: { name: "tool"; type: { kind: "OBJECT"; name: "ToolType"; ofType: null } };
      updated_at: {
        name: "updated_at";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null };
        };
      };
      visibility: {
        name: "visibility";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "ENUM"; name: "Visibility"; ofType: null };
        };
      };
      visible_to_groups: {
        name: "visible_to_groups";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "UserConnectionGroupType"; ofType: null };
            };
          };
        };
      };
      visible_to_users: {
        name: "visible_to_users";
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
      votes: {
        name: "votes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "INTERFACE"; name: "PostVoteInterface"; ofType: null };
            };
          };
        };
      };
    };
    possibleTypes: "PostReviewType" | "PostType";
  };
  PostReviewType: {
    kind: "OBJECT";
    name: "PostReviewType";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
      comments: {
        name: "comments";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "CommentType"; ofType: null };
            };
          };
        };
      };
      content: {
        name: "content";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      experience_hours: {
        name: "experience_hours";
        type: { kind: "SCALAR"; name: "Int"; ofType: null };
      };
      id: {
        name: "id";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
        };
      };
      importance: {
        name: "importance";
        type: { kind: "SCALAR"; name: "Decimal"; ofType: null };
      };
      is_private: {
        name: "is_private";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        };
      };
      is_review_later: {
        name: "is_review_later";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null };
        };
      };
      rating: { name: "rating"; type: { kind: "SCALAR"; name: "Decimal"; ofType: null } };
      recommended_to_groups: {
        name: "recommended_to_groups";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "UserConnectionGroupType"; ofType: null };
            };
          };
        };
      };
      recommended_to_users: {
        name: "recommended_to_users";
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
      reviewed_at: {
        name: "reviewed_at";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null };
        };
      };
      source: {
        name: "source";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      title: {
        name: "title";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      tool: {
        name: "tool";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "ToolType"; ofType: null };
        };
      };
      updated_at: {
        name: "updated_at";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null };
        };
      };
      usage_status: {
        name: "usage_status";
        type: { kind: "ENUM"; name: "UsageStatus"; ofType: null };
      };
      visibility: {
        name: "visibility";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "ENUM"; name: "Visibility"; ofType: null };
        };
      };
      visible_to_groups: {
        name: "visible_to_groups";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "UserConnectionGroupType"; ofType: null };
            };
          };
        };
      };
      visible_to_users: {
        name: "visible_to_users";
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
      votes: {
        name: "votes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "PostReviewVoteType"; ofType: null };
            };
          };
        };
      };
    };
  };
  PostReviewVoteType: {
    kind: "OBJECT";
    name: "PostReviewVoteType";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
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
      is_vote_positive: {
        name: "is_vote_positive";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
      };
    };
  };
  PostType: {
    kind: "OBJECT";
    name: "PostType";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
      comments: {
        name: "comments";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "CommentType"; ofType: null };
            };
          };
        };
      };
      content: {
        name: "content";
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
      recommended_to_groups: {
        name: "recommended_to_groups";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "UserConnectionGroupType"; ofType: null };
            };
          };
        };
      };
      recommended_to_users: {
        name: "recommended_to_users";
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
      source: {
        name: "source";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      title: {
        name: "title";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
        };
      };
      tool: { name: "tool"; type: { kind: "OBJECT"; name: "ToolType"; ofType: null } };
      updated_at: {
        name: "updated_at";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "DateTime"; ofType: null };
        };
      };
      visibility: {
        name: "visibility";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "ENUM"; name: "Visibility"; ofType: null };
        };
      };
      visible_to_groups: {
        name: "visible_to_groups";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "UserConnectionGroupType"; ofType: null };
            };
          };
        };
      };
      visible_to_users: {
        name: "visible_to_users";
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
      votes: {
        name: "votes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "PostVoteType"; ofType: null };
            };
          };
        };
      };
    };
  };
  PostTypeInput: {
    kind: "INPUT_OBJECT";
    name: "PostTypeInput";
    isOneOf: false;
    inputFields: [
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
    ];
  };
  PostVoteInterface: {
    kind: "INTERFACE";
    name: "PostVoteInterface";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
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
      is_vote_positive: {
        name: "is_vote_positive";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
      };
    };
    possibleTypes: "PostReviewVoteType" | "PostVoteType";
  };
  PostVoteType: {
    kind: "OBJECT";
    name: "PostVoteType";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
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
      is_vote_positive: {
        name: "is_vote_positive";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
      };
      post: {
        name: "post";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
        };
      };
    };
  };
  Query: {
    kind: "OBJECT";
    name: "Query";
    fields: {
      me: {
        name: "me";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
        };
      };
      post: {
        name: "post";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "PostType"; ofType: null };
        };
      };
      posts: {
        name: "posts";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "PostType"; ofType: null };
            };
          };
        };
      };
      tool: {
        name: "tool";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "ToolType"; ofType: null };
        };
      };
      tool_review: {
        name: "tool_review";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "PostReviewType"; ofType: null };
        };
      };
      tool_reviews: {
        name: "tool_reviews";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "PostReviewType"; ofType: null };
            };
          };
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
  ToolAlternativeTypeInput: {
    kind: "INPUT_OBJECT";
    name: "ToolAlternativeTypeInput";
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
          ofType: { kind: "INPUT_OBJECT"; name: "OneToManyInput"; ofType: null };
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
        type: { kind: "INPUT_OBJECT"; name: "IDBaseFilterLookup"; ofType: null };
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
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
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
        type: { kind: "SCALAR"; name: "Decimal"; ofType: null };
        defaultValue: null;
      },
      {
        name: "importance";
        type: { kind: "SCALAR"; name: "Decimal"; ofType: null };
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
            ofType: { kind: "INPUT_OBJECT"; name: "ToolTagTypeInput"; ofType: null };
          };
        };
        defaultValue: null;
      },
    ];
  };
  ToolReviewVoteType: {
    kind: "OBJECT";
    name: "ToolReviewVoteType";
    fields: {
      id: {
        name: "id";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "ID"; ofType: null };
        };
      };
      is_vote_positive: {
        name: "is_vote_positive";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
      };
      review: {
        name: "review";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
        };
      };
    };
  };
  ToolTagFilter: {
    kind: "INPUT_OBJECT";
    name: "ToolTagFilter";
    isOneOf: false;
    inputFields: [
      {
        name: "id";
        type: { kind: "INPUT_OBJECT"; name: "IDBaseFilterLookup"; ofType: null };
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
      is_important: {
        name: "is_important";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "SCALAR"; name: "Boolean"; ofType: null };
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
        type: { kind: "OBJECT"; name: "ToolTagType"; ofType: null };
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
      votes: {
        name: "votes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ToolTagVoteType"; ofType: null };
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
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
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
  ToolTagVoteType: {
    kind: "OBJECT";
    name: "ToolTagVoteType";
    fields: {
      author: {
        name: "author";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: { kind: "OBJECT"; name: "UserType"; ofType: null };
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
      is_vote_positive: {
        name: "is_vote_positive";
        type: { kind: "SCALAR"; name: "Boolean"; ofType: null };
      };
    };
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
      tags: {
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
              ofType: { kind: "OBJECT"; name: "ToolTagType"; ofType: null };
            };
          };
        };
      };
    };
  };
  ToolTypeInput: {
    kind: "INPUT_OBJECT";
    name: "ToolTypeInput";
    isOneOf: false;
    inputFields: [
      { name: "id"; type: { kind: "SCALAR"; name: "ID"; ofType: null }; defaultValue: null },
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
        name: "type";
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
        name: "alternatives";
        type: {
          kind: "LIST";
          name: never;
          ofType: {
            kind: "NON_NULL";
            name: never;
            ofType: { kind: "INPUT_OBJECT"; name: "ToolAlternativeTypeInput"; ofType: null };
          };
        };
        defaultValue: null;
      },
    ];
  };
  Upload: unknown;
  UsageStatus: {
    name: "UsageStatus";
    enumValues: "USING" | "USED" | "WANT_TO_USE" | "INTERESTED" | "NOT_INTERESTED";
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
      avatar: { name: "avatar"; type: { kind: "OBJECT"; name: "DjangoFileType"; ofType: null } };
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
              ofType: { kind: "OBJECT"; name: "UserConnectionGroupType"; ofType: null };
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
          ofType: { kind: "SCALAR"; name: "String"; ofType: null };
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
      library_comments: {
        name: "library_comments";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      library_posts: {
        name: "library_posts";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      library_reviews: {
        name: "library_reviews";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      library_tools: {
        name: "library_tools";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      post_votes: {
        name: "post_votes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "PostVoteType"; ofType: null };
            };
          };
        };
      };
      read_later_comments: {
        name: "read_later_comments";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      read_later_posts: {
        name: "read_later_posts";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      read_later_reviews: {
        name: "read_later_reviews";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      read_later_tools: {
        name: "read_later_tools";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "DjangoModelType"; ofType: null };
            };
          };
        };
      };
      tool_review_votes: {
        name: "tool_review_votes";
        type: {
          kind: "NON_NULL";
          name: never;
          ofType: {
            kind: "LIST";
            name: never;
            ofType: {
              kind: "NON_NULL";
              name: never;
              ofType: { kind: "OBJECT"; name: "ToolReviewVoteType"; ofType: null };
            };
          };
        };
      };
      username: {
        name: "username";
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
        name: "username";
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
        name: "email";
        type: { kind: "SCALAR"; name: "String"; ofType: null };
        defaultValue: null;
      },
      {
        name: "connection_groups";
        type: { kind: "INPUT_OBJECT"; name: "ManyToOneInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "avatar";
        type: { kind: "SCALAR"; name: "Upload"; ofType: null };
        defaultValue: null;
      },
      {
        name: "read_later_posts";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "read_later_tools";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "read_later_comments";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "read_later_reviews";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "library_posts";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "library_tools";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "library_comments";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
      {
        name: "library_reviews";
        type: { kind: "INPUT_OBJECT"; name: "ManyToManyInput"; ofType: null };
        defaultValue: null;
      },
    ];
  };
  Visibility: {
    name: "Visibility";
    enumValues:
      | "PRIVATE"
      | "USERS_SELECTED"
      | "CONNECTION_GROUPS_SELECTED"
      | "CONNECTIONS"
      | "SUBSCRIBERS_PAID"
      | "SUBSCRIBERS"
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
