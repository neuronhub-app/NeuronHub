---
reviewed_at: 2025.10.20
---

## Architecture

### Overview

Privacy-first sharing of expertise: products, publications, opinions, news, links, etc.
- Users can publish separate versions of their `models.Post` (News, Comments, Reviews, etc) to different User groups (circles).
- Users use `User.aliases` for anonymity, each UserAlias has its own reputation in its Areas: SWE, Physics, Math, Biology, etc.

### Core Models

```mermaid
classDiagram
    class User {
        username
        password
        aliases: M2M~User~
        areas: M2M~Area~
    }

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
            
            %% CharField
            title
            content_polite
            content_direct
            source

            %% Sharing
            visibility = Visibility.PUBLIC
            visible_to_users: M2M~User~
            visible_to_groups: M2M~UserConnectionGroup~
            recommended_to_users: M2M~User~
            recommended_to_groups: M2M~UserConnectionGroup~
        }

        class PostTool {
            <<projection>>
            parent: never
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
            parent: Post
            author: User
            content: str
        }
    }

    `Post.Type` -- Post : type
    Post ..|> PostTool : type = Tool
    Post ..|> PostReview : type = Review
    Post ..|> PostComment : type = Comment

    Post --> PostComment
    PostReview --> PostComment

    Post --> PostVote : votes
    class PostVote {
        post: Post
        author: User
        is_vote_positive
        is_changed_my_mind
    }

    Post --> PostTag : tags
    PostReview --> PostTag : review_tags
    class PostTag {
        tag_parent: PostTag
        name: str
        is_review_tag
        is_important
    }

    PostTag --> PostTagVote : votes
    class PostTagVote {
        post: Post
        tag: PostTag
        author: User
        comment: str
        is_vote_positive
        is_changed_my_mind
    }
    
    User o-- Post : author
```

### Tech Stack

- Server: Django v5.2, Strawberry GraphQL, PostgreSQL, pytest, uv, mypy
- Client: React Router v7, @chakra-ui, react-hook-form, Zod, Valtio, Apollo, gql-tada, Bun, Biome
- DevOps: Mise, Coder, Docker

#### Constraints
- JavaScript ecosystem is bad
- GraphQL cache design isn't feasible
- Django is heavily in tech debt
- React state management became legacy due to the `Proxy` objects
- React Router server API and SSR won't be used

### Project Structure

- `schema.graphql` - the single GraphQL schema
- `docs/`
- `.calude/issues/{doing|closed|not-started}` - project tasks, named as `123-fix-perf-tags-SQL.md`, referenced as `#123` in Git commits.

#### Backend `server/neuronhub`

- `apps/posts/` - core `Post` models and logic
- `apps/tests/` - faker `Gen` factories, db_stubs_repopulate, pytest base class, etc
- `apps/importer/` - importer of Posts from external sources, eg HackerNews

A typical `neuronhub.apps` module structure: `models.py` → `services.py` → `graphql/{types,resolvers,mutations}.py`.

Tags and votes are unified across `Post`'s `<<projection>>`s with models: `PostTag`, `PostVote`, `PostTagVote`. 

```python
class Visibility(models.TextChoices):
    PRIVATE
    USERS_SELECTED
    CONNECTIONS
    SUBSCRIBERS_PAID
    SUBSCRIBERS
    INTERNAL
    PUBLIC
```

#### Frontend `client/`
- `e2e/` - Playwright with its `e2e/tests`
- `src/routes.ts` - has react-router `RouteConfig`, and `export const urls = { ... }` for usage as `urls.reviews.list`.
- `src/apps/` - mirrors `server/neuronhub/apps/`
  - has specialized dirs to match the react-router urls structure, eg has both `/posts` and `reviews/`.
  - react-router v7 `export default` are in empty `index.tsx` files.
  - when a component or hook are used only by one page - it's placed in same dir as react-router `index.tsx`.
- `src/components/` - components shared between `src/apps/`
  - `forms/` - Chakra inputs adapted for react-hook-form.
  - `posts/` - shared code for all `Post` react-hook-forms.
  - `posts/form/*.tsx` - fields for use in `Post` forms.
  - `posts/form/schemas.ts` - all Zod `export namespace schemas` for `Post` react-hook-forms, and serializers + deserializers.
  - `ui/` - deprecated bad "Closed Components" forced by the old @chakra-ui. We're replacing them with `@chakra-ui/react` imports.
  - `layout/` - react-router layouts.
- GraphQL
  - `src/graphql/mutateAndRefetchMountedQueries.ts` - use it instead `client.mutate()`
  - `src/graphql/useApolloQuery.ts` - use instead broken `useQuery`, including its `isLoadingFirstTime` instead of `loading`
  - `src/graphql/client.ts` - Apollo `client`
  - `src/codegen.ts` - is only used for TS enums generation - for GraphQL types we use gql.tada.
- `src/theme/` - @chakra-ui theme config and semantic tokens
- `src/env.ts` - typed `env`
