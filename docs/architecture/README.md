## Tech Stack

- Server: Django v5.2, Strawberry GraphQL, PostgreSQL, pytest, uv, mypy
- Client: React Router v7, @chakra-ui, react-hook-form, Zod, Valtio, Apollo, gql-tada, Bun, Biome
- Search: Algolia
- DevOps: Mise, GitHub CI, Docker

## Overview

NeuronHub is privacy-first platform for sharing expertise: links, opinions, news, tools, products, etc. Users limit the visibility of their `models.Post` (Posts, Reviews, Comments) by selected User groups (akin Google Circles).

## Core Django Models

```mermaid
classDiagram
    `Post.Type` -- Post: type
    Post ..|> PostTool: type = Tool
    Post ..|> PostReview: type = Review
    Post ..|> PostComment: type = Comment
    Post --> PostComment
    PostReview --> PostComment

    namespace posts {
        class `Post.Type` {
            <<enumeration>>
            Post
            Tool
            Review
            Comment
        }

        class Post {
            id
            type: Post.Type
            parent?: Post
            author: User
            tags: M2M~PostTag~
        %% CharFields
            title: str
            source: str
            content_polite
            content_direct
            content_rant
            content_private
        %% Sharable fields
            visibility = Visibility.INTERNAL
            visible_to_users: M2M~User~
            visible_to_groups: M2M~UserConnectionGroup~
            recommended_to_users: M2M~User~
            recommended_to_groups: M2M~UserConnectionGroup~
        }

        class PostTool {
            <<projection>>
            parent: null
            tool_type = ToolType.Program
            company: ToolCompany
            github_url
        }

        class PostReview {
            <<projection>>
            parent: Post | PostTool
            review_usage_status: UsageStatus
            review_rating: int
            review_importance: int
            review_tags: M2M~PostTag~
            is_review_later
        }

        class PostComment {
            <<projection>>
            parent_root: Post
            parent: Post | PostComment
            author: User
            content_polite: str
        }

        class PostVote {
            post: Post
            author: User
            is_vote_positive
            is_changed_my_mind
        }

        class PostTag {
            tag_parent: PostTag
            name: str
            is_review_tag
            is_important
        }

        class PostTagVote {
            post: Post
            tag: PostTag
            author: User
            comment: str
            is_vote_positive
            is_changed_my_mind
        }
    }

    PostTag --> PostTagVote: votes
    Post --> PostTag: tags
    PostReview --> PostTag: review_tags
    Post --> PostVote: votes
    User o-- Post: author
    class User {
        username
        password
        aliases: M2M~User~
        areas: M2M~Area~
    }

    Post -- PostSource

    namespace importer {
        class PostSource {
            user_source: importer.UserSource
            id_external: int
            domain: ImportDomain.HackerNews
            rank: int
            url: str
            url_of_source: str
        }
    }
```

## Task-specific MUST-read docs

You must read each top-level doc before its children.

- [./backend](./backend/README.md)
- [./frontend](./frontend/README.md)
	- [How to structure a React Component](./frontend/React-component-structure.md)
	- [How to use GraphQL](./frontend/GraphQL.md)
	- [How to use Chakra UI](./frontend/Chakra-UI.md)
- [./tests](./tests.md)
	- [How to use pytest](./backend/pytest.md)
	- [How to use Playwright](./frontend/Playwright.md)
- [Algolia integration](./algolia.md) - used on all FE /posts list pages for its Facets, Pagination, and InstantSearch.
